import { useState, useEffect, FC, DragEvent, FormEvent, useCallback, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useIssues } from './hooks/useIssues';
import { useCollections } from './hooks/useCollections';
import { LoginForm } from './components/LoginForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { TrialSignupForm } from './components/TrialSignupForm';
import AdminDashboard from './components/AdminDashboard';
import MetricsDashboard from './components/MetricsDashboard';
import { WelcomeModal } from './components/WelcomeModal';
import { OnboardingModal } from './components/OnboardingModal';
import { OnboardingChecklist } from './components/OnboardingChecklist';
import ContactUs from './components/ContactUs';
import { Issue, CreateIssueRequest, UpdateIssueRequest, UserDetail, IssueWithHistory } from './services/api';
import { api } from './services/apiFactory';

// --- Types ---
interface FrontendIssue {
    id: string;
    title: string;
    description: string;
    itemId: string;
    status: string;
    labels: string[];
    location?: string;
    type: 'problem' | 'suggestion';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: string;
    assignee?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

// Helper function to convert backend Issue to frontend format
const convertBackendIssueToFrontend = (backendIssue: Issue): FrontendIssue => ({
    id: backendIssue.id,
    title: backendIssue.title,
    description: backendIssue.description || '',
    itemId: backendIssue.item_id || '',
    status: backendIssue.status,
    labels: backendIssue.collections?.map(c => c.name) || [],
    location: (backendIssue as any).location, // Location field to be added to backend
    type: backendIssue.type,
    priority: backendIssue.priority,
    assigned_to: backendIssue.assigned_to,
    assignee: backendIssue.assignee,
});

const PROBLEM_COLUMNS = [
    "Newly Reported",
    "Under Assessment",
    "Awaiting Parts",
    "In Repair",
    "Resolved/Ready for Circulation",
] as const;

const SUGGESTION_COLUMNS = [
    "Received",
    "In Progress", 
    "Complete",
] as const;

const PREDETERMINED_LABELS = [
    "Equipment & Tools",
    "Musical Instruments", 
    "Digital & Tech",
    "In-House Items",
    "Support Services",
    "Other"
] as const;

const LIBRARY_BRANCHES = [
    "Riverside Central",
    "Oakwood Community",
    "Heritage District",
    "Bayview Heights",
    "Westgate Plaza"
] as const;

// --- Helper for label colours ---
const getLabelColour = (_label: string): string => {
    // All labels now use the default collection styling with Professional Blue theme
    return 'bg-blue-100 text-blue-700';
};

// --- Helper for priority styling ---
const getPriorityStyle = (priority: 'low' | 'medium' | 'high' | 'urgent'): string => {
    switch (priority) {
        case 'urgent':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'high':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low':
            return 'bg-green-100 text-green-800 border-green-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// --- Helper for priority icon ---
const getPriorityIcon = (priority: 'low' | 'medium' | 'high' | 'urgent'): string => {
    switch (priority) {
        case 'urgent':
            return '🔥';
        case 'high':
            return '⚡';
        case 'medium':
            return '⚠️';
        case 'low':
            return 'ℹ️';
        default:
            return '📋';
    }
};

// --- Issue Card Component ---
interface KanbanCardProps {
    issue: FrontendIssue;
    onEdit: (issue: FrontendIssue) => void;
}

const KanbanCard = memo<KanbanCardProps>(({ issue, onEdit }) => {
    const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("issueId", String(issue.id));
        e.dataTransfer.effectAllowed = "move";
    }, [issue.id]);

    const handleEdit = useCallback(() => {
        onEdit(issue);
    }, [issue, onEdit]);

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="relative bg-white p-4 mb-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing border border-blue-200 hover:shadow-md transition-shadow"
        >
            <button 
                onClick={handleEdit} 
                className="absolute top-2 right-2 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label={`Edit issue: ${issue.title}`}
                title="Edit this issue"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
            </button>
            
            {/* Priority and Assignment indicators */}
            <div className="flex items-center gap-2 mb-2">
                <button 
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityStyle(issue.priority)}`}
                    title={`Priority: ${issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}`}
                >
                    <span>{getPriorityIcon(issue.priority)}</span>
                    <span className="capitalize">{issue.priority}</span>
                </button>
                {issue.assignee && (
                    <button 
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"
                        title={`Assigned to: ${issue.assignee.first_name} ${issue.assignee.last_name}`}
                    >
                        <span>👤</span>
                        <span>{issue.assignee.first_name} {issue.assignee.last_name.split(' ')[0]}</span>
                    </button>
                )}
            </div>
            
            <h4 className="font-bold text-gray-800 pr-6">{issue.title}</h4>
            <p className="text-sm text-gray-600 mt-1">Barcode: {issue.itemId}</p>
            <p className="text-sm text-gray-500 mt-2">{issue.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {issue.labels.map(label => (
                    <span key={label} className={`text-xs font-semibold px-2 py-1 rounded-full ${getLabelColour(label)}`}>
                        {label}
                    </span>
                ))}
                {issue.location && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        📍 {issue.location}
                    </span>
                )}
            </div>
        </div>
    );
});

KanbanCard.displayName = 'KanbanCard';

// --- Kanban Column Component ---
interface KanbanColumnProps {
    status: string;
    issues: FrontendIssue[];
    draggedOverColumn: string | null;
    setDraggedOverColumn: (status: string | null) => void;
    setEditingIssue: (issue: FrontendIssue) => void;
    onDrop: (status: string, issueId: string) => void;
}

const KanbanColumn = memo<KanbanColumnProps>(({ 
    status, 
    issues, 
    draggedOverColumn, 
    setDraggedOverColumn, 
    setEditingIssue,
    onDrop 
}) => {
    const issuesInColumn = issues.filter(issue => issue.status === status);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const issueId = e.dataTransfer.getData("issueId");
        if (issueId) {
            onDrop(status, issueId);
        }
        setDraggedOverColumn(null);
    }, [status, onDrop, setDraggedOverColumn]);

    const handleDragEnter = useCallback(() => {
        setDraggedOverColumn(status);
    }, [status, setDraggedOverColumn]);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        // Only clear if we're leaving the column, not entering a child
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDraggedOverColumn(null);
        }
    }, [setDraggedOverColumn]);

    return (
        <div
            className={`kanban-column bg-blue-50 rounded-xl p-4 flex-shrink-0 transition-colors duration-200 ${
                draggedOverColumn === status ? 'bg-blue-100' : ''
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-blue-700">{status}</h3>
                <span className="bg-blue-100 text-blue-700 font-semibold rounded-full px-2 py-0.5 text-sm">
                    {issuesInColumn.length}
                </span>
            </div>
            <div className="h-full overflow-y-auto">
               {issuesInColumn.map(issue => (
                   <KanbanCard 
                        key={issue.id} 
                        issue={issue} 
                        onEdit={setEditingIssue}
                    />
               ))}
                {draggedOverColumn === status && (
                    <div className="mt-3 p-4 border-2 border-dashed border-blue-400 rounded-lg flex justify-center items-center">
                        <span className="text-blue-500 font-bold text-2xl">+</span>
                    </div>
                )}
            </div>
        </div>
    );
});

KanbanColumn.displayName = 'KanbanColumn';

// --- Modal for creating new issue ---
interface CreateIssueModalProps {
    setShowModal: (show: boolean) => void;
    handleCreateIssue: (issueData: CreateIssueRequest) => Promise<void>;
    viewType: 'problem' | 'suggestion';
    collections: Array<{id: string, name: string}>;
}

const CreateIssueModal = memo<CreateIssueModalProps>(({ setShowModal, handleCreateIssue, viewType, collections }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [itemId, setItemId] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [issueType, setIssueType] = useState<'problem' | 'suggestion'>(viewType);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCollectionSelect = useCallback((labelToSelect: string) => {
        setSelectedCollection(prev => prev === labelToSelect ? '' : labelToSelect);
    }, []);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Title is required.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const selectedCollectionId = collections.find(c => c.name === selectedCollection)?.id;
            
            const issueData: any = {
                title: title.trim(),
                description: description.trim() || undefined,
                item_id: itemId.trim() || undefined,
                type: issueType,
                priority: 'medium',
                collection_ids: selectedCollectionId ? [selectedCollectionId] : undefined,
                location: selectedLocation || undefined,
            };
            
            await handleCreateIssue(issueData);
            setShowModal(false);
        } catch (error) {
            console.error('Error creating issue:', error);
            alert('Failed to create issue. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [title, description, itemId, selectedCollection, issueType, collections, handleCreateIssue, setShowModal]);

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            setShowModal(false);
        }
    }, [isSubmitting, setShowModal]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Create a Ticket</h2>
                <div className="flex justify-center gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setIssueType('problem')}
                        disabled={isSubmitting}
                        className={`flex-1 text-center px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                            issueType === 'problem'
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        I have a problem to report
                    </button>
                    <button
                        type="button"
                        onClick={() => setIssueType('suggestion')}
                        disabled={isSubmitting}
                        className={`flex-1 text-center px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                            issueType === 'suggestion'
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        I have a suggestion
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            {issueType === 'suggestion' ? 'Item (if applicable)' : 'Issue Title'}
                        </label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            {issueType === 'suggestion' ? 'Barcode (if applicable)' : 'Barcode'}
                        </label>
                        <input 
                            type="text" 
                            value={itemId} 
                            onChange={e => setItemId(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            {issueType === 'suggestion' ? 'What is your suggestion?' : 'Description'}
                        </label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Collection</label>
                        <div className="flex flex-wrap gap-2">
                            {PREDETERMINED_LABELS.map(label => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => handleCollectionSelect(label)}
                                    disabled={isSubmitting}
                                    className={`px-3 py-1 rounded-full text-sm focus:outline-none transition-colors ${
                                        selectedCollection === label
                                            ? 'bg-blue-600 text-white font-semibold'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Location</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select a location...</option>
                            {LIBRARY_BRANCHES.map(branch => (
                                <option key={branch} value={branch}>
                                    {branch}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Ticket'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

CreateIssueModal.displayName = 'CreateIssueModal';

// --- Modal for editing an issue ---
interface EditIssueModalProps {
    issue: FrontendIssue;
    setShowModal: (issue: FrontendIssue | null) => void;
    handleUpdateIssue: (id: string, issueData: UpdateIssueRequest) => Promise<void>;
    collections: Array<{id: string, name: string}>;
    staffMembers: UserDetail[];
}

const EditIssueModal = memo<EditIssueModalProps>(({ issue, setShowModal, handleUpdateIssue, collections, staffMembers }) => {
    const [title, setTitle] = useState(issue.title);
    const [description, setDescription] = useState(issue.description);
    const [itemId, setItemId] = useState(issue.itemId);
    const [priority, setPriority] = useState(issue.priority);
    const [assignedTo, setAssignedTo] = useState(issue.assigned_to || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'history' | 'attachments'>('edit');
    const [issueHistory, setIssueHistory] = useState<IssueWithHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [urls, setUrls] = useState<{id: string, url: string, title: string}[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const [newUrlTitle, setNewUrlTitle] = useState('');
    
    const initialCollection = issue.labels.find(l => PREDETERMINED_LABELS.includes(l as any)) || '';
    const [selectedCollection, setSelectedCollection] = useState(initialCollection);
    const [selectedLocation, setSelectedLocation] = useState(issue.location || '');

    // Load history when tab is switched to history
    useEffect(() => {
        if (activeTab === 'history' && itemId && issueHistory.length === 0 && !isLoadingHistory) {
            const fetchHistory = async () => {
                setIsLoadingHistory(true);
                setHistoryError(null);
                try {
                    const response = await api.getIssueHistoryByBarcode(itemId);
                    if (response.success && response.data) {
                        setIssueHistory(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching issue history:', error);
                    setHistoryError('Failed to load issue history');
                } finally {
                    setIsLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [activeTab, itemId, issueHistory.length, isLoadingHistory]);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            alert('Title is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedCollectionId = collections.find(c => c.name === selectedCollection)?.id;
            
            const issueData: any = {
                title: title.trim(),
                description: description.trim() || undefined,
                item_id: itemId.trim() || undefined,
                priority: priority,
                assigned_to: assignedTo || undefined,
                collection_ids: selectedCollectionId ? [selectedCollectionId] : undefined,
                location: selectedLocation || undefined,
            };
            
            await handleUpdateIssue(issue.id, issueData);
            setShowModal(null);
        } catch (error) {
            console.error('Error updating issue:', error);
            alert('Failed to update issue. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [title, description, itemId, priority, assignedTo, selectedCollection, issue, collections, handleUpdateIssue, setShowModal]);

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            setShowModal(null);
        }
    }, [isSubmitting, setShowModal]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // File handling functions
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const validFiles: File[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        files.forEach(file => {
            if (file.size > maxSize) {
                alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                alert(`File "${file.name}" has an unsupported format. Please use JPG, PNG, PDF, DOC, DOCX, or TXT files.`);
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length > 0) {
            setAttachments(prev => [...prev, ...validFiles]);
            setUploadingFiles(true);
            
            // Simulate upload process (in a real app, you'd upload to server)
            setTimeout(() => {
                setUploadingFiles(false);
            }, 1000);
        }

        // Reset input
        event.target.value = '';
    }, []);

    const handleRemoveAttachment = useCallback((index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }, []);

    // URL handling functions
    const handleAddUrl = useCallback(() => {
        if (!newUrl.trim()) {
            alert('Please enter a URL.');
            return;
        }

        // Basic URL validation
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlPattern.test(newUrl.trim())) {
            alert('Please enter a valid URL.');
            return;
        }

        const urlToAdd = newUrl.trim();
        const titleToAdd = newUrlTitle.trim() || urlToAdd;
        
        // Ensure URL has protocol
        const fullUrl = urlToAdd.startsWith('http') ? urlToAdd : `https://${urlToAdd}`;
        
        const urlEntry = {
            id: Date.now().toString(),
            url: fullUrl,
            title: titleToAdd
        };

        setUrls(prev => [...prev, urlEntry]);
        setNewUrl('');
        setNewUrlTitle('');
    }, [newUrl, newUrlTitle]);

    const handleRemoveUrl = useCallback((id: string) => {
        setUrls(prev => prev.filter(url => url.id !== id));
    }, []);

    const getFileIcon = (file: File) => {
        const fileType = file.type;
        
        if (fileType.startsWith('image/')) {
            return (
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType === 'application/pdf') {
            return (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType.includes('word') || fileType === 'text/plain') {
            return (
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Edit Issue</h2>
                    <button 
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('edit')}
                        disabled={isSubmitting}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${
                            activeTab === 'edit'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Edit Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        disabled={isSubmitting || !itemId}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${
                            activeTab === 'history'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        } ${(isSubmitting || !itemId) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Item History {issueHistory.length > 0 && `(${issueHistory.length})`}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('attachments')}
                        disabled={isSubmitting}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${
                            activeTab === 'attachments'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Attachments {(attachments.length + urls.length) > 0 && `(${attachments.length + urls.length})`}
                    </button>
                </div>

                {/* Edit Tab Content */}
                {activeTab === 'edit' && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Issue Title</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                required 
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Barcode</label>
                            <input 
                                type="text" 
                                value={itemId} 
                                onChange={e => setItemId(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Description</label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Urgency Level</label>
                            <select 
                                value={priority} 
                                onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')} 
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                disabled={isSubmitting}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Assigned To</label>
                            <select 
                                value={assignedTo} 
                                onChange={e => setAssignedTo(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                disabled={isSubmitting}
                            >
                                <option value="">Unassigned</option>
                                {staffMembers
                                    .filter(staff => staff.role === 'staff' || staff.role === 'admin')
                                    .map(staff => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.first_name} {staff.last_name} ({staff.role})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Collection</label>
                            <select
                                value={selectedCollection}
                                onChange={(e) => setSelectedCollection(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a collection...</option>
                                {PREDETERMINED_LABELS.map(label => (
                                    <option key={label} value={label}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Location</label>
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a location...</option>
                                {LIBRARY_BRANCHES.map(branch => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleClose} 
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* History Tab Content */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {!itemId && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No barcode associated with this issue.</p>
                                <p className="text-sm mt-2">Add a barcode to view item history.</p>
                            </div>
                        )}
                        
                        {itemId && isLoadingHistory && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading history...</p>
                            </div>
                        )}

                        {itemId && historyError && (
                            <div className="text-center py-8 text-red-600">
                                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p>{historyError}</p>
                            </div>
                        )}

                        {itemId && !isLoadingHistory && !historyError && issueHistory.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="font-medium">No previous issues found</p>
                                <p className="text-sm mt-2">This is the first issue for item: {itemId}</p>
                            </div>
                        )}

                        {itemId && !isLoadingHistory && !historyError && issueHistory.length > 0 && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">Item:</span> {itemId} • 
                                        <span className="font-semibold ml-2">Total Issues:</span> {issueHistory.length}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {issueHistory.map((historyIssue) => {
                                        const isCurrentIssue = historyIssue.id === issue.id;
                                        const isResolved = historyIssue.resolved_at || 
                                                         historyIssue.status === 'Resolved/Ready for Circulation' || 
                                                         historyIssue.status === 'Complete';
                                        
                                        return (
                                            <div 
                                                key={historyIssue.id} 
                                                className={`border rounded-lg p-4 ${
                                                    isCurrentIssue 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : isResolved 
                                                        ? 'border-green-200 bg-green-50' 
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {isCurrentIssue && (
                                                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                                                    Current Issue
                                                                </span>
                                                            )}
                                                            {isResolved && !isCurrentIssue && (
                                                                <span className="text-green-600 text-xl">✓</span>
                                                            )}
                                                            <h4 className="font-bold text-gray-800">{historyIssue.title}</h4>
                                                        </div>
                                                        {historyIssue.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{historyIssue.description}</p>
                                                        )}
                                                    </div>
                                                    <div className={`ml-4 px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityStyle(historyIssue.priority)}`}>
                                                        <span>{getPriorityIcon(historyIssue.priority)}</span>
                                                        <span className="ml-1 capitalize">{historyIssue.priority}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                        <span className="font-semibold mr-1">Status:</span> {historyIssue.status}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                        <span className="font-semibold mr-1">Type:</span> {historyIssue.type === 'problem' ? 'Problem' : 'Suggestion'}
                                                    </span>
                                                    {historyIssue.collections && historyIssue.collections.length > 0 && (
                                                        historyIssue.collections.map(col => (
                                                            <span key={col.id} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                                {col.name}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Status Timeline */}
                                                {historyIssue.status_history && historyIssue.status_history.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <p className="text-xs font-semibold text-gray-700 mb-2">Status Timeline:</p>
                                                        <div className="space-y-2">
                                                            {historyIssue.status_history.map((history, idx) => (
                                                                <div key={history.id} className="flex items-start gap-2 text-xs">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className={`w-2 h-2 rounded-full ${
                                                                            idx === historyIssue.status_history!.length - 1 
                                                                                ? 'bg-blue-600' 
                                                                                : 'bg-gray-400'
                                                                        }`}></div>
                                                                        {idx < historyIssue.status_history!.length - 1 && (
                                                                            <div className="w-0.5 h-6 bg-gray-300"></div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 pb-2">
                                                                        <p className="text-gray-700">
                                                                            {history.old_status && (
                                                                                <span className="text-gray-500">{history.old_status} → </span>
                                                                            )}
                                                                            <span className="font-semibold">{history.new_status}</span>
                                                                        </p>
                                                                        <p className="text-gray-500 mt-0.5">
                                                                            {formatDate(history.created_at)}
                                                                            {history.changer && (
                                                                                <span> by {history.changer.first_name} {history.changer.last_name}</span>
                                                                            )}
                                                                        </p>
                                                                        {history.reason && (
                                                                            <p className="text-gray-600 mt-0.5 italic">{history.reason}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                                    <div>
                                                        <span className="font-semibold">Created:</span> {formatDate(historyIssue.created_at)}
                                                        {historyIssue.creator && (
                                                            <span> by {historyIssue.creator.first_name} {historyIssue.creator.last_name}</span>
                                                        )}
                                                    </div>
                                                    {historyIssue.assignee && (
                                                        <div>
                                                            <span className="font-semibold">Assigned to:</span> {historyIssue.assignee.first_name} {historyIssue.assignee.last_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center mt-6">
                                    <button 
                                        type="button" 
                                        onClick={handleClose}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Attachments Tab Content */}
                {activeTab === 'attachments' && (
                    <div className="space-y-4">
                        {/* File Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={uploadingFiles}
                            />
                            <label 
                                htmlFor="file-upload" 
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                    {uploadingFiles ? 'Uploading files...' : 'Click to upload files'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Support for JPG, PNG, PDF, DOC, DOCX, and TXT files
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Maximum file size: 10MB per file
                                </p>
                            </label>
                        </div>

                        {/* Upload Progress */}
                        {uploadingFiles && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                                    <span className="text-blue-700">Uploading files...</span>
                                </div>
                            </div>
                        )}

                        {/* URL Addition Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">Add URL Link</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">URL</label>
                                    <input
                                        type="url"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        placeholder="https://example.com or example.com"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={uploadingFiles}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Title (Optional)</label>
                                    <input
                                        type="text"
                                        value={newUrlTitle}
                                        onChange={(e) => setNewUrlTitle(e.target.value)}
                                        placeholder="Descriptive title for the link"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={uploadingFiles}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddUrl}
                                    disabled={uploadingFiles || !newUrl.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add URL
                                </button>
                            </div>
                        </div>

                        {/* URLs List */}
                        {urls.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-medium text-gray-700">Attached URLs</h3>
                                <div className="space-y-2">
                                    {urls.map((urlEntry) => (
                                        <div key={urlEntry.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {urlEntry.title}
                                                    </p>
                                                    <a 
                                                        href={urlEntry.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                                                    >
                                                        {urlEntry.url}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveUrl(urlEntry.id)}
                                                    disabled={uploadingFiles}
                                                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                                    title="Remove URL"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attachments List */}
                        {attachments.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-medium text-gray-700">Attached Files</h3>
                                <div className="space-y-2">
                                    {attachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getFileIcon(file)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttachment(index)}
                                                    disabled={uploadingFiles}
                                                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                                    title="Remove attachment"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {attachments.length === 0 && urls.length === 0 && !uploadingFiles && (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="font-medium">No attachments yet</p>
                                <p className="text-sm mt-2">Upload files or add URLs to provide additional context for this issue</p>
                            </div>
                        )}

                        <div className="flex justify-center mt-6">
                            <button 
                                type="button" 
                                onClick={handleClose}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

EditIssueModal.displayName = 'EditIssueModal';

// --- Authentication Pages ---
const LoginPage: FC = () => {
    const navigate = useNavigate();

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return <LoginForm onForgotPassword={handleForgotPassword} />;
};

const ForgotPasswordPage: FC = () => {
    const navigate = useNavigate();

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return <ForgotPasswordForm onBackToLogin={handleBackToLogin} />;
};

const ResetPasswordPage: FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    return <ResetPasswordForm token={token} />;
};

const TrialSignupPage: FC = () => {
    return <TrialSignupForm />;
};

// --- Main Dashboard Component ---
const Dashboard: FC = () => {
    const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
    const { issues: backendIssues, createIssue, updateIssue, fetchIssues, isLoading: issuesLoading, error: issuesError } = useIssues();
    const { collections } = useCollections();
    
    const [showModal, setShowModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
    const [activeUrgencyFilter, setActiveUrgencyFilter] = useState('All');
    const [activeBranchFilter, setActiveBranchFilter] = useState('All');
    const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
    const [editingIssue, setEditingIssue] = useState<FrontendIssue | null>(null);
    const [viewType, setViewType] = useState<'problem' | 'suggestion'>('problem');
    const [showAdminDashboard, setShowAdminDashboard] = useState(false);
    const [showMetricsDashboard, setShowMetricsDashboard] = useState(false);
    const [staffMembers, setStaffMembers] = useState<UserDetail[]>([]);

    // Fetch staff members for assignment dropdown
    useEffect(() => {
        const fetchStaffMembers = async () => {
            try {
                const response = await api.getUsers();
                if (response.success && response.data) {
                    setStaffMembers(response.data);
                }
            } catch (error) {
                console.error('Error fetching staff members:', error);
            }
        };
        
        if (isAuthenticated) {
            fetchStaffMembers();
        }
    }, [isAuthenticated]);

    // Convert backend issues to frontend format and apply filters
    const issues: FrontendIssue[] = backendIssues
        .filter(issue => issue.type === viewType)
        .map(convertBackendIssueToFrontend)
        .filter(issue => {
            // Apply category filter
            if (activeCategoryFilter === 'All') return true;
            return issue.labels.includes(activeCategoryFilter);
        })
        .filter(issue => {
            // Apply urgency filter
            if (activeUrgencyFilter === 'All') return true;
            return issue.priority === activeUrgencyFilter.toLowerCase();
        });

    const handleDrop = useCallback(async (newStatus: string, issueId: string) => {
        try {
            await updateIssue(issueId, { status: newStatus });
            setDraggedOverColumn(null);
        } catch (error) {
            console.error('Error updating issue status:', error);
            alert('Failed to update issue status. Please try again.');
        }
    }, [updateIssue]);

    const handleCreateIssue = useCallback(async (issueData: CreateIssueRequest) => {
        await createIssue(issueData);
    }, [createIssue]);

    const handleUpdateIssue = useCallback(async (id: string, issueData: UpdateIssueRequest) => {
        await updateIssue(id, issueData);
    }, [updateIssue]);

    // Show loading state
    if (authLoading || issuesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (issuesError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Issues</h3>
                    <p className="text-gray-600 mb-4">{issuesError}</p>
                    <button
                        onClick={() => fetchIssues({ type: viewType })}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const currentColumns = viewType === 'problem' ? PROBLEM_COLUMNS : SUGGESTION_COLUMNS;
    const filterOptions = ['All', ...currentColumns];
    const filteredColumns = activeFilter === 'All' ? currentColumns : currentColumns.filter(c => c === activeFilter);

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    // Show metrics dashboard if requested
    if (showMetricsDashboard) {
        return <MetricsDashboard onBack={() => setShowMetricsDashboard(false)} />;
    }

    // Show admin dashboard if requested
    if (showAdminDashboard) {
        return <AdminDashboard onBack={() => setShowAdminDashboard(false)} />;
    }

    return (
        <>
            <WelcomeModal />
            <OnboardingModal onCreateIssue={() => setShowModal(true)} />
            <OnboardingChecklist />
            <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 rounded-xl flex justify-center items-center mb-6 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl"></div>
                <div className="relative z-10 flex items-center gap-3">
                    <img 
                        src="/flowtracker-logo.svg" 
                        alt="FlowTracker Logo" 
                        className="w-10 h-10 md:w-12 md:h-12"
                    />
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide">FlowTracker</h1>
                </div>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 flex items-center gap-4">
                    <div className="text-white text-right">
                        <p className="font-medium text-lg">{user?.first_name} {user?.last_name}</p>
                        <p className="text-sm opacity-90">{user?.library.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setShowMetricsDashboard(true)}
                                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Reports
                                </button>
                                <button
                                    onClick={() => setShowAdminDashboard(true)}
                                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    Admin
                                </button>
                            </>
                        )}
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            <div className="mb-6 flex justify-center items-center gap-4 flex-wrap">
                <button
                    onClick={() => {
                        setViewType('problem');
                        setActiveFilter('All');
                        setActiveCategoryFilter('All');
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${
                        viewType === 'problem'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-700 hover:bg-gray-50'
                    }`}
                >
                    Problem Items
                </button>
                <button
                    onClick={() => {
                        setViewType('suggestion');
                        setActiveFilter('All');
                        setActiveCategoryFilter('All');
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${
                        viewType === 'suggestion'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-700 hover:bg-gray-50'
                    }`}
                >
                    Suggestions
                </button>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-blue-200"
                >
                    + Create a Ticket
                </button>
            </div>
            <div className="flex justify-center items-center flex-wrap gap-3 mb-4">
                {filterOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => setActiveFilter(option)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            activeFilter === option
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-800 hover:bg-gray-100 shadow-sm'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {/* Urgency Level Filter Buttons */}
            <div className="flex justify-center items-center flex-wrap gap-3 mb-4">
                {['All', 'Low', 'Medium', 'High', 'Urgent'].map(urgency => (
                    <button
                        key={urgency}
                        onClick={() => setActiveUrgencyFilter(urgency)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                            activeUrgencyFilter === urgency
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                        }`}
                    >
                        {urgency}
                    </button>
                ))}
            </div>
            {/* Category Filter Buttons */}
            <div className="flex justify-center items-center flex-wrap gap-3 mb-4">
                {['All', ...PREDETERMINED_LABELS].map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategoryFilter(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                            activeCategoryFilter === category
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            {/* Library Branch Filter Buttons */}
            <div className="flex justify-center items-center flex-wrap gap-3 mb-8">
                {['All', ...LIBRARY_BRANCHES].map(branch => (
                    <button
                        key={branch}
                        onClick={() => setActiveBranchFilter(branch)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                            activeBranchFilter === branch
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                        }`}
                    >
                        {branch}
                    </button>
                ))}
            </div>
            <main className="flex-grow overflow-x-auto pb-4">
                <div className="flex space-x-6 min-w-max">
                    {filteredColumns.map(status => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            issues={issues}
                            draggedOverColumn={draggedOverColumn}
                            setDraggedOverColumn={setDraggedOverColumn}
                            setEditingIssue={setEditingIssue}
                            onDrop={handleDrop}
                        />
                    ))}
                </div>
            </main>
            {showModal && (
                <CreateIssueModal 
                    setShowModal={setShowModal} 
                    handleCreateIssue={handleCreateIssue}
                    viewType={viewType}
                    collections={collections}
                />
            )}
            {editingIssue && (
                <EditIssueModal 
                    issue={editingIssue} 
                    setShowModal={setEditingIssue} 
                    handleUpdateIssue={handleUpdateIssue}
                    collections={collections}
                    staffMembers={staffMembers}
                />
            )}
            </div>
        </>
    );
};

// --- Footer Component ---
const Footer: FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-4 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
                <div className="text-sm text-gray-300 mb-2 sm:mb-0">
                    © 2025 FlowTracker. All rights reserved.
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                    <a 
                        href="/contact" 
                        className="text-sm text-gray-300 hover:text-white transition-colors underline"
                    >
                        Contact Us
                    </a>
                    <a 
                        href="/terms-of-service.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white transition-colors underline"
                    >
                        Terms of Service
                    </a>
                    <a 
                        href="/privacy-policy.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white transition-colors underline"
                    >
                        Privacy Policy
                    </a>
                    <a 
                        href="/service-level-agreement.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white transition-colors underline"
                    >
                        SLA
                    </a>
                    <a 
                        href="/data-processing-agreement.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white transition-colors underline"
                    >
                        DPA
                    </a>
                </div>
            </div>
        </footer>
    );
};

// --- Main App Component ---
const App: FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<TrialSignupPage />} />
                    <Route path="/trial-signup" element={<TrialSignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route 
                        path="/*" 
                        element={isAuthenticated ? <Dashboard /> : <LoginPage />} 
                    />
                </Routes>
                <Footer />
            </Router>
        </div>
    );
};

export default App;