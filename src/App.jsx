
import React, { useState, useEffect, createContext, useContext } from 'react';

// --- Icons (Placeholder as React-icons not available in this environment) ---
// In a real project, you would use:
// import { FaHome, FaProjectDiagram, FaUsers, FaDonate, FaHandshake, FaChartBar, FaClipboardList, FaUserShield, FaCog, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaArrowLeft, FaFileAlt, FaUpload, FaSearch, FaFilter, FaSort, FaEnvelope, FaCalendarAlt, FaHistory, FaBullseye } from 'react-icons/fa';
// For this environment, we'll use simple characters or text placeholders for icons.

const Icon = ({ name, className = '' }) => {
    const icons = {
        Home: '🏠', Dashboard: '📊', Projects: '🏗️', Beneficiaries: '👨‍👩‍👧‍👦', Donors: '💰',
        Volunteers: '🤝', Donations: '💸', Reports: '📈', Admin: '⚙️', Settings: '🛠️',
        Add: '➕', Edit: '📝', Delete: '🗑️', View: '👁️', Approve: '✅', Reject: '❌',
        Back: '⬅️', File: '📄', Upload: '⬆️', Search: '🔍', Filter: '🎚️', Sort: '↕️',
        Email: '✉️', Date: '📅', History: '📜', Target: '🎯',
        Completed: '✔️', Current: '➡️', Pending: '⏳', Breached: '🔴',
        Success: '✔️', Error: '❌', Warning: '⚠️', Info: 'ℹ️'
    };
    return <span className={`icon-${name.toLowerCase()} ${className}`}>{icons[name] || name}</span>;
};

// --- RBAC Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState('NGO Admin'); // Default role
    const permissions = {
        'NGO Admin': {
            dashboard: true, projects: true, beneficiaries: true, donors: true, volunteers: true, donations: true, reports: true, auditLogs: true,
            project: { view: true, create: true, edit: true, delete: true, approve: true, trackSLA: true, manageWorkflow: true },
            beneficiary: { view: true, create: true, edit: true, delete: true },
            donor: { view: true, create: true, edit: true, delete: true },
            volunteer: { view: true, create: true, edit: true, delete: true },
            donation: { view: true, create: true, edit: true, delete: true },
            auditLog: { view: true }
        },
        'Project Manager': {
            dashboard: true, projects: true, beneficiaries: true, donors: false, volunteers: true, donations: false, reports: true, auditLogs: false,
            project: { view: true, create: true, edit: true, delete: false, approve: true, trackSLA: true, manageWorkflow: true },
            beneficiary: { view: true, create: true, edit: true, delete: false },
            donor: { view: false, create: false, edit: false, delete: false },
            volunteer: { view: true, create: true, edit: true, delete: false },
            donation: { view: false, create: false, edit: false, delete: false },
            auditLog: { view: false }
        },
        'Volunteer': {
            dashboard: true, projects: true, beneficiaries: true, donors: false, volunteers: false, donations: false, reports: false, auditLogs: false,
            project: { view: true, create: false, edit: false, delete: false, approve: false, trackSLA: false, manageWorkflow: false },
            beneficiary: { view: true, create: false, edit: false, delete: false },
            donor: { view: false, create: false, edit: false, delete: false },
            volunteer: { view: false, create: false, edit: true, delete: false }, // Can edit own profile
            donation: { view: false, create: false, edit: false, delete: false },
            auditLog: { view: false }
        },
        'Donor': {
            dashboard: true, projects: true, beneficiaries: false, donors: false, volunteers: false, donations: true, reports: true, auditLogs: false,
            project: { view: true, create: false, edit: false, delete: false, approve: false, trackSLA: false, manageWorkflow: false },
            beneficiary: { view: false, create: false, edit: false, delete: false },
            donor: { view: false, create: false, edit: true, delete: false }, // Can edit own profile
            donation: { view: true, create: true, edit: false, delete: false },
            auditLog: { view: false }
        },
        'Beneficiary': {
            dashboard: true, projects: false, beneficiaries: true, donors: false, volunteers: false, donations: false, reports: false, auditLogs: false,
            project: { view: false, create: false, edit: false, delete: false, approve: false, trackSLA: false, manageWorkflow: false },
            beneficiary: { view: true, create: false, edit: true, delete: false }, // Can edit own profile
            donor: { view: false, create: false, edit: false, delete: false },
            volunteer: { view: false, create: false, edit: false, delete: false },
            donation: { view: false, create: false, edit: false, delete: false },
            auditLog: { view: false }
        }
    };

    const hasAccess = (area, action = 'view') => {
        const userPermissions = permissions[userRole];
        if (!userPermissions) return false;

        // Special handling for dashboard access
        if (area === 'dashboard') return userPermissions.dashboard;

        // Check module-level access
        if (typeof userPermissions[area] === 'boolean') {
            return userPermissions[area];
        }

        // Check action-level access within a module
        if (typeof userPermissions[area] === 'object' && userPermissions[area] !== null) {
            return userPermissions[area][action];
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ userRole, setUserRole, hasAccess }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// --- Dummy Data ---
const dummyData = {
    projects: [
        { id: 'proj001', name: 'Clean Water Initiative - Village A', managerId: 'pm001', beneficiariesCount: 120, status: 'InProgress', startDate: '2023-01-15', endDate: '2024-01-15', budget: 50000, fundsRaised: 35000, description: 'Providing access to clean and safe drinking water for all residents of Village A.', documentIds: ['docP001'],
          workflow: [
              { stage: 'Planning', status: 'Completed', date: '2022-12-01', actor: 'NGO Admin', sla: '30 days' },
              { stage: 'Funding', status: 'Completed', date: '2023-01-10', actor: 'NGO Admin', sla: '60 days' },
              { stage: 'Implementation', status: 'InProgress', date: '2023-02-01', actor: 'Project Manager', sla: '120 days', slaBreach: false },
              { stage: 'Monitoring & Evaluation', status: 'Pending', actor: 'Project Manager', sla: '90 days' },
              { stage: 'Closure', status: 'Pending', actor: 'NGO Admin', sla: '30 days' }
          ]
        },
        { id: 'proj002', name: 'Education for All - District B', managerId: 'pm002', beneficiariesCount: 250, status: 'Pending', startDate: '2023-03-01', endDate: '2024-03-01', budget: 75000, fundsRaised: 10000, description: 'Establishing learning centers and providing educational materials to underprivileged children in District B.', documentIds: ['docP002'],
          workflow: [
              { stage: 'Planning', status: 'Completed', date: '2023-01-01', actor: 'NGO Admin', sla: '30 days' },
              { stage: 'Funding', status: 'InProgress', date: '2023-02-10', actor: 'NGO Admin', sla: '60 days', slaBreach: true },
              { stage: 'Implementation', status: 'Pending', actor: 'Project Manager', sla: '120 days' },
              { stage: 'Monitoring & Evaluation', status: 'Pending', actor: 'Project Manager', sla: '90 days' },
              { stage: 'Closure', status: 'Pending', actor: 'NGO Admin', sla: '30 days' }
          ]
        },
        { id: 'proj003', name: 'Healthcare Access - Remote Areas', managerId: 'pm001', beneficiariesCount: 80, status: 'Approved', startDate: '2023-05-01', endDate: '2024-05-01', budget: 40000, fundsRaised: 40000, description: 'Mobile clinics and medical camps for remote communities.', documentIds: [],
            workflow: [
                { stage: 'Planning', status: 'Completed', date: '2023-03-01', actor: 'NGO Admin', sla: '30 days' },
                { stage: 'Funding', status: 'Completed', date: '2023-04-10', actor: 'NGO Admin', sla: '60 days' },
                { stage: 'Implementation', status: 'Pending', actor: 'Project Manager', sla: '120 days' },
                { stage: 'Monitoring & Evaluation', status: 'Pending', actor: 'Project Manager', sla: '90 days' },
                { stage: 'Closure', status: 'Pending', actor: 'NGO Admin', sla: '30 days' }
            ]
        },
        { id: 'proj004', name: 'Skill Development Workshop', managerId: 'pm003', beneficiariesCount: 50, status: 'Completed', startDate: '2022-09-01', endDate: '2022-12-31', budget: 15000, fundsRaised: 15000, description: 'Training youth in vocational skills.', documentIds: [],
            workflow: [
                { stage: 'Planning', status: 'Completed', date: '2022-08-01', actor: 'NGO Admin', sla: '30 days' },
                { stage: 'Funding', status: 'Completed', date: '2022-08-25', actor: 'NGO Admin', sla: '60 days' },
                { stage: 'Implementation', status: 'Completed', date: '2022-12-20', actor: 'Project Manager', sla: '120 days' },
                { stage: 'Monitoring & Evaluation', status: 'Completed', date: '2023-01-15', actor: 'Project Manager', sla: '90 days' },
                { stage: 'Closure', status: 'Completed', date: '2023-02-10', actor: 'NGO Admin', sla: '30 days' }
            ]
        },
        { id: 'proj005', name: 'Community Garden Project', managerId: 'pm002', beneficiariesCount: 30, status: 'Draft', startDate: '2023-07-01', endDate: '2023-11-30', budget: 5000, fundsRaised: 0, description: 'Creating a sustainable food source for local communities.', documentIds: [],
            workflow: [
                { stage: 'Planning', status: 'InProgress', date: '2023-06-01', actor: 'Project Manager', sla: '30 days' },
                { stage: 'Funding', status: 'Pending', actor: 'NGO Admin', sla: '60 days' },
                { stage: 'Implementation', status: 'Pending', actor: 'Project Manager', sla: '120 days' },
                { stage: 'Monitoring & Evaluation', status: 'Pending', actor: 'Project Manager', sla: '90 days' },
                { stage: 'Closure', status: 'Pending', actor: 'NGO Admin', sla: '30 days' }
            ]
        }
    ],
    beneficiaries: [
        { id: 'ben001', name: 'Aisha Rahman', projectId: 'proj001', status: 'Active', supportType: 'Water Access', age: 7, gender: 'Female', location: 'Village A', assignedVolunteerId: 'vol001', details: 'Aisha is a young girl whose family previously struggled with water scarcity. Now receives daily clean water.', documentIds: ['docB001'] },
        { id: 'ben002', name: 'Kumar Singh', projectId: 'proj002', status: 'OnHold', supportType: 'Education', age: 12, gender: 'Male', location: 'District B', assignedVolunteerId: 'vol002', details: 'Kumar needs school supplies and tutoring. Currently on hold due to family relocation.', documentIds: [] },
        { id: 'ben003', name: 'Fatima Ali', projectId: 'proj001', status: 'Active', supportType: 'Water Access', age: 45, gender: 'Female', location: 'Village A', assignedVolunteerId: 'vol001', details: 'Fatima\'s family of 5 benefits from the new water source.', documentIds: [] },
        { id: 'ben004', name: 'David Lee', projectId: 'proj003', status: 'PendingApproval', supportType: 'Medical Aid', age: 60, gender: 'Male', location: 'Remote Area C', details: 'Elderly man requiring regular check-ups and medication.', documentIds: [] },
        { id: 'ben005', name: 'Maria Garcia', projectId: 'proj004', status: 'Completed', supportType: 'Skill Training', age: 22, gender: 'Female', location: 'City D', details: 'Successfully completed computer literacy course and found employment.', assignedVolunteerId: 'vol003', documentIds: [] },
        { id: 'ben006', name: 'Ahmed Hassan', projectId: 'proj002', status: 'Active', supportType: 'Education', age: 9, gender: 'Male', location: 'District B', assignedVolunteerId: 'vol002', details: 'Regularly attends the learning center and shows significant improvement.', documentIds: [] }
    ],
    donors: [
        { id: 'don001', name: 'Global Impact Fund', type: 'Organization', email: 'info@globalimpact.org', totalDonated: 150000, lastDonation: '2023-03-20', status: 'Active', contactPerson: 'Jane Doe', documents: [] },
        { id: 'don002', name: 'Sarah Chen', type: 'Individual', email: 'sarah.c@example.com', totalDonated: 5000, lastDonation: '2023-04-01', status: 'Active', contactPerson: 'Sarah Chen', documents: [] },
        { id: 'don003', name: 'Community Builders Inc.', type: 'Organization', email: 'contact@communitybuilders.com', totalDonated: 25000, lastDonation: '2022-11-10', status: 'Inactive', contactPerson: 'John Smith', documents: [] },
        { id: 'don004', name: 'Tech Solutions Corp', type: 'Organization', email: 'hello@techsolutions.com', totalDonated: 75000, lastDonation: '2023-05-15', status: 'Active', contactPerson: 'Emily White', documents: [] }
    ],
    volunteers: [
        { id: 'vol001', name: 'Michael Brown', skills: ['Water Management', 'Community Outreach'], projectId: 'proj001', status: 'Active', email: 'michael.b@example.com', lastActivity: '2023-05-20', documents: [] },
        { id: 'vol002', name: 'Priya Sharma', skills: ['Teaching', 'Childcare'], projectId: 'proj002', status: 'Active', email: 'priya.s@example.com', lastActivity: '2023-05-22', documents: [] },
        { id: 'vol003', name: 'Carlos Rodriguez', skills: ['IT Support', 'Training'], projectId: 'proj004', status: 'Inactive', email: 'carlos.r@example.com', lastActivity: '2023-01-10', documents: [] },
        { id: 'vol004', name: 'Sophie Dubois', skills: ['Healthcare', 'First Aid'], projectId: 'proj003', status: 'Pending', email: 'sophie.d@example.com', lastActivity: null, documents: [] },
        { id: 'vol005', name: 'David Kim', skills: ['Gardening', 'Logistics'], projectId: 'proj005', status: 'Active', email: 'david.k@example.com', lastActivity: '2023-06-01', documents: [] }
    ],
    donations: [
        { id: 'donat001', donorId: 'don001', projectId: 'proj001', amount: 20000, date: '2023-01-05', status: 'Completed', type: 'Cash', documentIds: [] },
        { id: 'donat002', donorId: 'don002', projectId: 'proj002', amount: 1000, date: '2023-02-15', status: 'Completed', type: 'In-Kind (Books)', documentIds: [] },
        { id: 'donat003', donorId: 'don001', projectId: 'proj001', amount: 15000, date: '2023-03-20', status: 'Completed', type: 'Cash', documentIds: [] },
        { id: 'donat004', donorId: 'don004', projectId: 'proj003', amount: 40000, date: '2023-05-15', status: 'Completed', type: 'Cash', documentIds: [] },
        { id: 'donat005', donorId: 'don002', projectId: 'proj002', amount: 500, date: '2023-06-01', status: 'Pending', type: 'Cash', documentIds: [] }
    ],
    auditLogs: [
        { id: 'log001', timestamp: '2023-05-25 10:30:00', actor: 'NGO Admin', action: 'Project Created', entityType: 'Project', entityId: 'proj005', details: 'New project "Community Garden Project" initiated.' },
        { id: 'log002', timestamp: '2023-05-25 11:00:00', actor: 'Project Manager', action: 'Beneficiary Status Update', entityType: 'Beneficiary', entityId: 'ben002', details: 'Beneficiary Kumar Singh status changed to OnHold.' },
        { id: 'log003', timestamp: '2023-05-24 16:45:00', actor: 'Donor', action: 'Profile Update', entityType: 'Donor', entityId: 'don002', details: 'Donor Sarah Chen updated contact info.' },
        { id: 'log004', timestamp: '2023-05-23 09:15:00', actor: 'NGO Admin', action: 'Project Approval', entityType: 'Project', entityId: 'proj003', details: 'Project "Healthcare Access - Remote Areas" approved.' }
    ],
    documents: {
        docP001: { id: 'docP001', name: 'Water Initiative Plan.pdf', type: 'PDF', uploadedBy: 'NGO Admin', date: '2023-01-01' },
        docP002: { id: 'docP002', name: 'Education Budget.xlsx', type: 'Excel', uploadedBy: 'Project Manager', date: '2023-02-05' },
        docB001: { id: 'docB001', name: 'Aisha Rahman Consent.pdf', type: 'PDF', uploadedBy: 'Project Manager', date: '2023-01-20' }
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 'Approved': case 'Completed': case 'Closed': return 'status-Approved';
        case 'InProgress': case 'Assigned': return 'status-InProgress';
        case 'Pending': case 'ActionRequired': case 'PendingApproval': return 'status-Pending';
        case 'Rejected': case 'SLABreach': case 'Blocked': return 'status-Rejected';
        case 'Exception': case 'Escalation': return 'status-Exception';
        case 'Draft': case 'Archived': case 'OnHold': return 'status-Draft';
        default: return '';
    }
};

const formatCurrency = (amount) => `$${new Intl.NumberFormat('en-US').format(amount)}`;
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

// --- Reusable Components ---
const Card = ({ title, status, children, onClick, footer, headerColor = '', bodyTint = '', className = '' }) => (
    <div className={`card ${getStatusClass(status)} ${className}`} onClick={onClick}>
        <div className="card-header" style={headerColor ? { backgroundColor: headerColor } : {}}>
            <span>{title}</span>
            {status && <span className="card-badge">{status}</span>}
        </div>
        <div className="card-body" style={bodyTint ? { backgroundColor: bodyTint } : {}}>
            {children}
        </div>
        {footer && <div className="card-footer">{footer}</div>}
    </div>
);

const KPI = ({ label, value, icon, onClick, isPulse = false, color = 'var(--color-primary)' }) => (
    <div
        className={`kpi-card ${isPulse ? 'pulse-animation' : ''}`}
        onClick={onClick}
        style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
    >
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
    </div>
);

const ChartPlaceholder = ({ title, type, onExport }) => (
    <div className="chart-card">
        <h3>
            {title}
            {onExport && (
                <div className="flex-start gap-sm">
                    <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); onExport('pdf'); }}>PDF</button>
                    <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); onExport('excel'); }}>Excel</button>
                </div>
            )}
        </h3>
        <div className="chart-placeholder">
            {type} Chart Placeholder
        </div>
    </div>
);

const ToastNotification = ({ message, type, id }) => {
    return (
        <div className={`toast ${type}`}>
            <span className={`toast-icon ${type}`}><Icon name={type} /></span>
            <span className="toast-message">{message}</span>
        </div>
    );
};

// --- App Component ---
function App() {
    const { userRole, setUserRole, hasAccess } = useAuth();
    const [currentScreen, setCurrentScreen] = useState('Dashboard');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [screenHistory, setScreenHistory] = useState(['Dashboard']); // Stack for navigation
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Automatically remove toasts after a delay
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                setNotifications(prev => prev.slice(1));
            }, 3000); // 3 seconds
            return () => clearTimeout(timer);
        }
    }, [notifications]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
    };

    const navigateTo = (screen, recordId = null, bypassHistory = false) => {
        if (!bypassHistory) {
            setScreenHistory(prev => {
                const newHistory = [...prev];
                // Prevent duplicate consecutive screens in history unless recordId changes
                if (newHistory.length > 0 && newHistory[newHistory.length - 1] === screen && selectedRecord === recordId) {
                    return newHistory;
                }
                newHistory.push(screen);
                return newHistory;
            });
        }
        setCurrentScreen(screen);
        setSelectedRecord(recordId);
    };

    const goBack = () => {
        setScreenHistory(prev => {
            if (prev.length > 1) {
                const newHistory = prev.slice(0, -1);
                setCurrentScreen(newHistory[newHistory.length - 1]);
                setSelectedRecord(null); // Assuming back clears selected record for list view
                return newHistory;
            }
            return prev; // Stay on current screen if no history
        });
    };

    // --- Screens ---

    const Breadcrumbs = ({ history, navigate }) => {
        if (history.length <= 1) return null;
        return (
            <div className="breadcrumbs">
                {history.map((screenName, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span>/</span>}
                        {index === history.length - 1 ? (
                            <span>{screenName.replace('List', 's').replace('Detail', ' Details').replace('Form', ' Form')}</span>
                        ) : (
                            <a href="#" onClick={() => navigate(screenName, null, true)}>
                                {screenName.replace('List', 's').replace('Detail', ' Details').replace('Form', ' Form')}
                            </a>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const ProjectCard = ({ project }) => {
        const { id, name, managerId, beneficiariesCount, status, budget, fundsRaised } = project;
        const manager = dummyData.volunteers.find(v => v.id === managerId) || { name: 'N/A' };
        return (
            <Card
                title={name}
                status={status}
                onClick={() => navigateTo('ProjectDetail', id)}
                footer={<span>Manager: {manager.name} | Beneficiaries: {beneficiariesCount}</span>}
            >
                <p><strong>Budget:</strong> {formatCurrency(budget)}</p>
                <p><strong>Funds Raised:</strong> {formatCurrency(fundsRaised)}</p>
            </Card>
        );
    };

    const BeneficiaryCard = ({ beneficiary }) => {
        const { id, name, projectId, status, supportType, location, age } = beneficiary;
        const project = dummyData.projects.find(p => p.id === projectId) || { name: 'N/A' };
        return (
            <Card
                title={name}
                status={status}
                onClick={() => navigateTo('BeneficiaryDetail', id)}
                footer={<span>Project: {project.name} | Location: {location}</span>}
            >
                <p><strong>Support Type:</strong> {supportType}</p>
                <p><strong>Age:</strong> {age}</p>
            </Card>
        );
    };

    const DonorCard = ({ donor }) => {
        const { id, name, type, totalDonated, lastDonation, status } = donor;
        return (
            <Card
                title={name}
                status={status}
                onClick={() => navigateTo('DonorDetail', id)}
                footer={<span>Type: {type} | Last Donation: {formatDate(lastDonation)}</span>}
            >
                <p><strong>Total Donated:</strong> {formatCurrency(totalDonated)}</p>
            </Card>
        );
    };

    const VolunteerCard = ({ volunteer }) => {
        const { id, name, skills, projectId, status, lastActivity } = volunteer;
        const project = dummyData.projects.find(p => p.id === projectId) || { name: 'N/A' };
        return (
            <Card
                title={name}
                status={status}
                onClick={() => navigateTo('VolunteerDetail', id)}
                footer={<span>Project: {project.name} | Last Activity: {formatDate(lastActivity)}</span>}
            >
                <p><strong>Skills:</strong> {skills.join(', ')}</p>
            </Card>
        );
    };

    const DonationCard = ({ donation }) => {
        const { id, donorId, projectId, amount, date, status, type } = donation;
        const donor = dummyData.donors.find(d => d.id === donorId) || { name: 'Anonymous' };
        const project = dummyData.projects.find(p => p.id === projectId) || { name: 'N/A' };
        return (
            <Card
                title={`${type} from ${donor.name}`}
                status={status}
                onClick={() => navigateTo('DonationDetail', id)}
                footer={<span>Project: {project.name} | Date: {formatDate(date)}</span>}
            >
                <p><strong>Amount:</strong> {formatCurrency(amount)}</p>
            </Card>
        );
    };

    const AuditLogCard = ({ log }) => {
        const { id, timestamp, actor, action, entityType, entityId, details } = log;
        return (
            <Card
                title={`${entityType} ${action}`}
                status={'Info'} // Using 'Info' as a generic status for logs
                headerColor="var(--color-info)"
                onClick={() => navigateTo('AuditLogDetail', id)}
                footer={<span>Actor: {actor} | Entity ID: {entityId}</span>}
            >
                <p><strong>Timestamp:</strong> {timestamp}</p>
                <p className="detail-description">{details}</p>
            </Card>
        );
    };

    const RecentActivityCard = ({ activity }) => {
        const { id, timestamp, actor, action, details } = activity;
        return (
            <Card
                title={`${actor} - ${action}`}
                status={'Info'}
                headerColor="var(--color-secondary)"
                onClick={() => showToast(`Activity detail: ${id}`, 'info')}
                footer={<span>{timestamp}</span>}
            >
                <p className="detail-description">{details}</p>
            </Card>
        );
    };

    const ProjectDetail = ({ projectId }) => {
        const project = dummyData.projects.find(p => p.id === projectId);
        if (!project || !hasAccess('project', 'view')) {
            return (
                <div className="full-screen-page">
                    <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                    <div className="page-header">
                        <h2>Access Denied</h2>
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Error" /></span>
                        <h3>You do not have permission to view this project.</h3>
                        <p>Please contact your administrator if you believe this is an error.</p>
                    </div>
                </div>
            );
        }

        const projectManager = dummyData.volunteers.find(v => v.id === project.managerId) || { name: 'N/A', email: 'N/A' };
        const relatedBeneficiaries = dummyData.beneficiaries.filter(b => b.projectId === projectId);
        const relatedDonations = dummyData.donations.filter(d => d.projectId === projectId);
        const projectDocuments = project.documentIds?.map(docId => dummyData.documents[docId]).filter(Boolean) || [];

        const handleProjectAction = (actionType) => {
            showToast(`Project ${project.name}: ${actionType} triggered. (Simulated)`, 'info');
            if (actionType === 'edit') navigateTo('ProjectForm', projectId);
            // In a real app, this would involve API calls
        };

        const currentStage = project.workflow.find(stage => stage.status === 'InProgress') || project.workflow.find(stage => stage.status === 'Pending');

        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Project: {project.name}</h2>
                    <div className="page-actions">
                        {hasAccess('project', 'edit') && (
                            <button className="btn btn-primary" onClick={() => handleProjectAction('edit')}><Icon name="Edit" /> Edit</button>
                        )}
                        {hasAccess('project', 'approve') && project.status === 'Pending' && (
                            <button className="btn btn-success" onClick={() => handleProjectAction('approve')}><Icon name="Approve" /> Approve</button>
                        )}
                        {hasAccess('project', 'delete') && (
                            <button className="btn btn-danger" onClick={() => handleProjectAction('delete')}><Icon name="Delete" /> Delete</button>
                        )}
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                </div>

                <div className="data-overview">
                    <div className="overview-main">
                        <div className="detail-section">
                            <h3>Project Overview <span className={`card-badge ${getStatusClass(project.status)}`}>{project.status}</span></h3>
                            <div className="detail-item"><span className="detail-label">Project ID:</span> <span className="detail-value">{project.id}</span></div>
                            <div className="detail-item"><span className="detail-label">Manager:</span> <span className="detail-value">{projectManager.name} ({projectManager.email})</span></div>
                            <div className="detail-item"><span className="detail-label">Start Date:</span> <span className="detail-value">{formatDate(project.startDate)}</span></div>
                            <div className="detail-item"><span className="detail-label">End Date:</span> <span className="detail-value">{formatDate(project.endDate)}</span></div>
                            <div className="detail-item"><span className="detail-label">Budget:</span> <span className="detail-value">{formatCurrency(project.budget)}</span></div>
                            <div className="detail-item"><span className="detail-label">Funds Raised:</span> <span className="detail-value">{formatCurrency(project.fundsRaised)}</span></div>
                            <div className="detail-item"><span className="detail-label">Description:</span> <span className="detail-value detail-description">{project.description}</span></div>
                        </div>

                        {hasAccess('project', 'manageWorkflow') && (
                            <div className="detail-section">
                                <h3>Workflow Progress <Icon name="History" /></h3>
                                <div className="workflow-tracker">
                                    {project.workflow.map((stage, index) => (
                                        <div key={index} className={`workflow-stage ${stage.status.toLowerCase().replace('in progress', 'current').replace('pending', 'pending').replace('completed', 'completed')}`}>
                                            <span className="workflow-stage-icon">
                                                {stage.status === 'Completed' ? <Icon name="Completed" /> : stage.status === 'InProgress' ? <Icon name="Current" /> : <Icon name="Pending" />}
                                            </span>
                                            <div className="workflow-stage-details">
                                                <h4>{stage.stage}</h4>
                                                <p>Assigned to: {stage.actor} {stage.date ? `on ${formatDate(stage.date)}` : ''}</p>
                                            </div>
                                            {stage.sla && (
                                                <span className={`workflow-stage-sla ${stage.slaBreach ? 'breached' : ''}`}>
                                                    SLA: {stage.sla} {stage.slaBreach && <Icon name="Breached" />}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {projectDocuments.length > 0 && (
                            <div className="detail-section">
                                <h3>Documents <Icon name="File" /></h3>
                                <div className="file-list">
                                    {projectDocuments.map(doc => (
                                        <div key={doc.id} className="file-item">
                                            <span className="file-name"><Icon name="File" /> {doc.name}</span>
                                            <button className="btn-icon" onClick={() => showToast(`Downloading ${doc.name}...`, 'info')}><Icon name="Download" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="overview-sidebar">
                        {hasAccess('beneficiary', 'view') && relatedBeneficiaries.length > 0 && (
                            <div className="detail-section">
                                <h3>Related Beneficiaries <Icon name="Beneficiaries" /></h3>
                                <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    {relatedBeneficiaries.map(ben => (
                                        <BeneficiaryCard key={ben.id} beneficiary={ben} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasAccess('donation', 'view') && relatedDonations.length > 0 && (
                            <div className="detail-section">
                                <h3>Related Donations <Icon name="Donations" /></h3>
                                <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    {relatedDonations.map(donat => (
                                        <DonationCard key={donat.id} donation={donat} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const ProjectForm = ({ projectId }) => {
        const isEditing = !!projectId;
        const project = isEditing ? dummyData.projects.find(p => p.id === projectId) : {};
        const [formData, setFormData] = useState({
            name: project?.name || '',
            description: project?.description || '',
            managerId: project?.managerId || '',
            startDate: project?.startDate || '',
            endDate: project?.endDate || '',
            budget: project?.budget || 0,
            status: project?.status || 'Draft',
            files: [] // For file uploads
        });
        const [errors, setErrors] = useState({});

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
        };

        const handleFileChange = (e) => {
            setFormData(prev => ({ ...prev, files: [...prev.files, ...Array.from(e.target.files)] }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            const newErrors = {};
            if (!formData.name) newErrors.name = 'Project name is mandatory.';
            if (!formData.managerId) newErrors.managerId = 'Project manager is mandatory.';
            if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Budget must be a positive number.';

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                showToast('Please correct the form errors.', 'error');
                return;
            }

            console.log('Form data submitted:', formData);
            showToast(`Project ${isEditing ? 'updated' : 'created'} successfully! (Simulated)`, 'success');
            // In a real app, send data to backend.
            // For now, navigate back to list or detail
            isEditing ? navigateTo('ProjectDetail', projectId) : navigateTo('ProjectsList');
        };

        if (!hasAccess('project', isEditing ? 'edit' : 'create')) {
            return (
                <div className="full-screen-page">
                    <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                    <div className="page-header">
                        <h2>Access Denied</h2>
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Error" /></span>
                        <h3>You do not have permission to {isEditing ? 'edit' : 'create'} projects.</h3>
                        <p>Please contact your administrator if you believe this is an error.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>{isEditing ? `Edit Project: ${project?.name}` : 'Create New Project'}</h2>
                    <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                </div>
                <form onSubmit={handleSubmit} className="detail-section">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Project Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Clean Water Initiative" required />
                            {errors.name && <p className="form-error">{errors.name}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="managerId">Project Manager <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <select id="managerId" name="managerId" value={formData.managerId} onChange={handleChange} required>
                                <option value="">Select a Manager</option>
                                {dummyData.volunteers.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                            {errors.managerId && <p className="form-error">{errors.managerId}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="startDate">Start Date</label>
                            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">End Date</label>
                            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="budget">Budget <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <input type="number" id="budget" name="budget" value={formData.budget} onChange={handleChange} min="0" required />
                            {errors.budget && <p className="form-error">{errors.budget}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} disabled={userRole !== 'NGO Admin'}>
                                {['Draft', 'Pending', 'InProgress', 'Approved', 'Completed', 'Rejected'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the project goals and activities..."></textarea>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                            <label>Documents <Icon name="File" /></label>
                            <div className="file-upload-container" onClick={() => document.getElementById('file-upload').click()}>
                                <input type="file" id="file-upload" multiple onChange={handleFileChange} />
                                <span className="upload-icon"><Icon name="Upload" /></span>
                                <p>Drag & drop files here or click to browse</p>
                            </div>
                            {formData.files.length > 0 && (
                                <div className="file-list">
                                    {formData.files.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <span className="file-name"><Icon name="File" /> {file.name}</span>
                                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) })); }}><Icon name="Delete" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={goBack}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Project'}</button>
                    </div>
                </form>
            </div>
        );
    };

    const BeneficiaryDetail = ({ beneficiaryId }) => {
        const beneficiary = dummyData.beneficiaries.find(b => b.id === beneficiaryId);

        // Record-level security: Beneficiaries can only view their own record
        if (userRole === 'Beneficiary' && beneficiaryId !== 'ben001') { // Example: assume ben001 is the logged-in beneficiary
            return (
                <div className="full-screen-page">
                    <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                    <div className="page-header">
                        <h2>Access Denied</h2>
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Error" /></span>
                        <h3>You do not have permission to view this beneficiary's record.</h3>
                        <p>Beneficiaries can only access their own details.</p>
                    </div>
                </div>
            );
        }

        if (!beneficiary || !hasAccess('beneficiary', 'view')) {
            return (
                <div className="full-screen-page">
                    <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                    <div className="page-header">
                        <h2>Access Denied</h2>
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Error" /></span>
                        <h3>You do not have permission to view this beneficiary.</h3>
                        <p>Please contact your administrator if you believe this is an error.</p>
                    </div>
                </div>
            );
        }

        const project = dummyData.projects.find(p => p.id === beneficiary.projectId) || { name: 'N/A' };
        const volunteer = dummyData.volunteers.find(v => v.id === beneficiary.assignedVolunteerId) || { name: 'N/A', email: 'N/A' };
        const beneficiaryDocuments = beneficiary.documentIds?.map(docId => dummyData.documents[docId]).filter(Boolean) || [];


        const handleBeneficiaryAction = (actionType) => {
            showToast(`Beneficiary ${beneficiary.name}: ${actionType} triggered. (Simulated)`, 'info');
            if (actionType === 'edit') navigateTo('BeneficiaryForm', beneficiaryId);
        };

        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Beneficiary: {beneficiary.name}</h2>
                    <div className="page-actions">
                        {hasAccess('beneficiary', 'edit') && (userRole !== 'Beneficiary' || beneficiaryId === 'ben001') && ( // Beneficiary can only edit self
                            <button className="btn btn-primary" onClick={() => handleBeneficiaryAction('edit')}><Icon name="Edit" /> Edit</button>
                        )}
                        {hasAccess('beneficiary', 'delete') && (
                            <button className="btn btn-danger" onClick={() => handleBeneficiaryAction('delete')}><Icon name="Delete" /> Delete</button>
                        )}
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                </div>

                <div className="detail-section">
                    <h3>Beneficiary Profile <span className={`card-badge ${getStatusClass(beneficiary.status)}`}>{beneficiary.status}</span></h3>
                    <div className="detail-item"><span className="detail-label">Beneficiary ID:</span> <span className="detail-value">{beneficiary.id}</span></div>
                    <div className="detail-item"><span className="detail-label">Project:</span> <span className="detail-value">{project.name}</span></div>
                    <div className="detail-item"><span className="detail-label">Support Type:</span> <span className="detail-value">{beneficiary.supportType}</span></div>
                    <div className="detail-item"><span className="detail-label">Age:</span> <span className="detail-value">{beneficiary.age}</span></div>
                    <div className="detail-item"><span className="detail-label">Gender:</span> <span className="detail-value">{beneficiary.gender}</span></div>
                    <div className="detail-item"><span className="detail-label">Location:</span> <span className="detail-value">{beneficiary.location}</span></div>
                    {hasAccess('volunteer', 'view') && (
                        <div className="detail-item"><span className="detail-label">Assigned Volunteer:</span> <span className="detail-value">{volunteer.name} ({volunteer.email})</span></div>
                    )}
                    <div className="detail-item"><span className="detail-label">Details:</span> <span className="detail-value detail-description">{beneficiary.details}</span></div>
                </div>

                {beneficiaryDocuments.length > 0 && (
                    <div className="detail-section">
                        <h3>Documents <Icon name="File" /></h3>
                        <div className="file-list">
                            {beneficiaryDocuments.map(doc => (
                                <div key={doc.id} className="file-item">
                                    <span className="file-name"><Icon name="File" /> {doc.name}</span>
                                    <button className="btn-icon" onClick={() => showToast(`Downloading ${doc.name}...`, 'info')}><Icon name="Download" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related activities, communication logs could go here */}
            </div>
        );
    };

    const BeneficiaryForm = ({ beneficiaryId }) => {
        const isEditing = !!beneficiaryId;
        const beneficiary = isEditing ? dummyData.beneficiaries.find(b => b.id === beneficiaryId) : {};
        const [formData, setFormData] = useState({
            name: beneficiary?.name || '',
            projectId: beneficiary?.projectId || '',
            supportType: beneficiary?.supportType || '',
            age: beneficiary?.age || 0,
            gender: beneficiary?.gender || '',
            location: beneficiary?.location || '',
            assignedVolunteerId: beneficiary?.assignedVolunteerId || '',
            status: beneficiary?.status || 'Active',
            details: beneficiary?.details || '',
            files: []
        });
        const [errors, setErrors] = useState({});

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            setErrors(prev => ({ ...prev, [name]: '' }));
        };

        const handleFileChange = (e) => {
            setFormData(prev => ({ ...prev, files: [...prev.files, ...Array.from(e.target.files)] }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            const newErrors = {};
            if (!formData.name) newErrors.name = 'Beneficiary name is mandatory.';
            if (!formData.projectId) newErrors.projectId = 'Project is mandatory.';
            if (!formData.supportType) newErrors.supportType = 'Support type is mandatory.';
            if (!formData.age || formData.age <= 0) newErrors.age = 'Age must be a positive number.';

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                showToast('Please correct the form errors.', 'error');
                return;
            }

            console.log('Form data submitted:', formData);
            showToast(`Beneficiary ${isEditing ? 'updated' : 'created'} successfully! (Simulated)`, 'success');
            isEditing ? navigateTo('BeneficiaryDetail', beneficiaryId) : navigateTo('BeneficiariesList');
        };

        if (!hasAccess('beneficiary', isEditing ? 'edit' : 'create')) {
            return (
                <div className="full-screen-page">
                    <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                    <div className="page-header">
                        <h2>Access Denied</h2>
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Error" /></span>
                        <h3>You do not have permission to {isEditing ? 'edit' : 'create'} beneficiaries.</h3>
                        <p>Please contact your administrator if you believe this is an error.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>{isEditing ? `Edit Beneficiary: ${beneficiary?.name}` : 'Create New Beneficiary'}</h2>
                    <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                </div>
                <form onSubmit={handleSubmit} className="detail-section">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Aisha Rahman" required />
                            {errors.name && <p className="form-error">{errors.name}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="projectId">Project <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <select id="projectId" name="projectId" value={formData.projectId} onChange={handleChange} required>
                                <option value="">Select a Project</option>
                                {dummyData.projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.projectId && <p className="form-error">{errors.projectId}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="supportType">Support Type <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <input type="text" id="supportType" name="supportType" value={formData.supportType} onChange={handleChange} placeholder="e.g., Water Access, Education" required />
                            {errors.supportType && <p className="form-error">{errors.supportType}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="age">Age <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} min="0" required />
                            {errors.age && <p className="form-error">{errors.age}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender">Gender</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Village A" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="assignedVolunteerId">Assigned Volunteer</label>
                            <select id="assignedVolunteerId" name="assignedVolunteerId" value={formData.assignedVolunteerId} onChange={handleChange}>
                                <option value="">Assign Volunteer</option>
                                {dummyData.volunteers.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange}>
                                {['Active', 'OnHold', 'Completed', 'PendingApproval'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                            <label htmlFor="details">Details</label>
                            <textarea id="details" name="details" value={formData.details} onChange={handleChange} placeholder="Any specific needs or notes..."></textarea>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                            <label>Documents <Icon name="File" /></label>
                            <div className="file-upload-container" onClick={() => document.getElementById('file-upload').click()}>
                                <input type="file" id="file-upload" multiple onChange={handleFileChange} />
                                <span className="upload-icon"><Icon name="Upload" /></span>
                                <p>Drag & drop files here or click to browse</p>
                            </div>
                            {formData.files.length > 0 && (
                                <div className="file-list">
                                    {formData.files.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <span className="file-name"><Icon name="File" /> {file.name}</span>
                                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) })); }}><Icon name="Delete" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={goBack}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Beneficiary'}</button>
                    </div>
                </form>
            </div>
        );
    };

    const AuditLogDetail = ({ logId }) => {
        const log = dummyData.auditLogs.find(l => l.id === logId);

        if (!log || !hasAccess('auditLog', 'view')) {
            return (
                <div className="full-screen-page">
                    <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                    <div className="page-header">
                        <h2>Access Denied</h2>
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Error" /></span>
                        <h3>You do not have permission to view audit logs.</h3>
                        <p>This feature is restricted to authorized roles.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Audit Log: {log.id}</h2>
                    <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                </div>

                <div className="detail-section">
                    <h3>Log Details</h3>
                    <div className="detail-item"><span className="detail-label">Timestamp:</span> <span className="detail-value">{log.timestamp}</span></div>
                    <div className="detail-item"><span className="detail-label">Actor:</span> <span className="detail-value">{log.actor}</span></div>
                    <div className="detail-item"><span className="detail-label">Action:</span> <span className="detail-value">{log.action}</span></div>
                    <div className="detail-item"><span className="detail-label">Entity Type:</span> <span className="detail-value">{log.entityType}</span></div>
                    <div className="detail-item"><span className="detail-label">Entity ID:</span> <span className="detail-value">{log.entityId}</span></div>
                    <div className="detail-item"><span className="detail-label">Details:</span> <span className="detail-value detail-description">{log.details}</span></div>
                </div>
            </div>
        );
    };

    const AdminDashboard = () => {
        const totalProjects = dummyData.projects.length;
        const inProgressProjects = dummyData.projects.filter(p => p.status === 'InProgress').length;
        const pendingApprovals = dummyData.projects.filter(p => p.status === 'Pending').length;
        const totalBeneficiaries = dummyData.beneficiaries.length;
        const totalDonors = dummyData.donors.length;
        const totalVolunteers = dummyData.volunteers.length;
        const fundsRaised = dummyData.projects.reduce((acc, p) => acc + p.fundsRaised, 0);

        const recentActivities = dummyData.auditLogs.slice(0, 5).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

        const handleChartExport = (type) => {
            showToast(`Exporting chart to ${type}. (Simulated)`, 'info');
        };

        if (!hasAccess('dashboard')) {
            return (
                <div className="full-screen-page">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view this dashboard.</p>
                </div>
            );
        }

        return (
            <div className="full-screen-page">
                <h1 className="dashboard-section-title">Dashboard</h1>

                <div className="dashboard-kpi-grid">
                    <KPI
                        label="Total Projects"
                        value={totalProjects}
                        icon={<Icon name="Projects" />}
                        onClick={() => navigateTo('ProjectsList')}
                        color="var(--color-primary)"
                    />
                    <KPI
                        label="In Progress Projects"
                        value={inProgressProjects}
                        icon={<Icon name="InProgress" />}
                        onClick={() => navigateTo('ProjectsList', null, { status: 'InProgress' })} // Example for filter
                        color="var(--color-info)"
                        isPulse
                    />
                    <KPI
                        label="Pending Approvals"
                        value={pendingApprovals}
                        icon={<Icon name="Pending" />}
                        onClick={() => navigateTo('ProjectsList', null, { status: 'Pending' })}
                        color="var(--color-warning)"
                        isPulse
                    />
                    <KPI
                        label="Total Beneficiaries"
                        value={totalBeneficiaries}
                        icon={<Icon name="Beneficiaries" />}
                        onClick={() => navigateTo('BeneficiariesList')}
                        color="var(--color-secondary)"
                    />
                    <KPI
                        label="Total Donors"
                        value={totalDonors}
                        icon={<Icon name="Donors" />}
                        onClick={() => navigateTo('DonorsList')}
                        color="var(--color-accent)"
                    />
                    <KPI
                        label="Total Volunteers"
                        value={totalVolunteers}
                        icon={<Icon name="Volunteers" />}
                        onClick={() => navigateTo('VolunteersList')}
                        color="var(--color-success)"
                    />
                     <KPI
                        label="Total Funds Raised"
                        value={formatCurrency(fundsRaised)}
                        icon={<Icon name="Donations" />}
                        onClick={() => navigateTo('DonationsList')}
                        color="var(--color-exception)"
                    />
                </div>

                <h2 className="dashboard-section-title">Impact Overview</h2>
                <div className="dashboard-charts-grid">
                    <ChartPlaceholder title="Project Status Distribution" type="Donut" onExport={handleChartExport} />
                    <ChartPlaceholder title="Funds Raised Over Time" type="Line" onExport={handleChartExport} />
                    <ChartPlaceholder title="Beneficiaries by Project" type="Bar" onExport={handleChartExport} />
                    <ChartPlaceholder title="Volunteer Engagement" type="Gauge" onExport={handleChartExport} />
                </div>

                {recentActivities.length > 0 && (
                    <div className="dashboard-section-title">Recent Activities</div>
                )}
                {recentActivities.length > 0 ? (
                    <div className="card-grid">
                        {recentActivities.map(activity => (
                            <RecentActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="History" /></span>
                        <h3>No Recent Activities</h3>
                        <p>There are no recent system activities to display at this moment.</p>
                    </div>
                )}
            </div>
        );
    };

    const ProjectsList = () => {
        if (!hasAccess('projects')) {
            return (
                <div className="full-screen-page">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view projects.</p>
                </div>
            );
        }
        const filteredProjects = userRole === 'Volunteer'
            ? dummyData.projects.filter(p => p.managerId === 'vol001') // Assuming vol001 is the logged-in volunteer for demo
            : dummyData.projects; // Admins, PMs see all

        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Projects</h2>
                    <div className="page-actions">
                        {hasAccess('project', 'create') && (
                            <button className="btn btn-primary" onClick={() => navigateTo('ProjectForm')}><Icon name="Add" /> New Project</button>
                        )}
                        <button className="btn btn-secondary"><Icon name="Filter" /> Filter</button>
                        <button className="btn btn-secondary"><Icon name="Sort" /> Sort</button>
                    </div>
                </div>
                {filteredProjects.length > 0 ? (
                    <div className="card-grid">
                        {filteredProjects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Projects" /></span>
                        <h3>No Projects Found</h3>
                        <p>There are no projects matching your criteria. Start by creating a new one!</p>
                        {hasAccess('project', 'create') && (
                            <button className="btn btn-primary" onClick={() => navigateTo('ProjectForm')}><Icon name="Add" /> Create Project</button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const BeneficiariesList = () => {
        if (!hasAccess('beneficiaries')) {
            return (
                <div className="full-screen-page">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view beneficiaries.</p>
                </div>
            );
        }

        let filteredBeneficiaries = dummyData.beneficiaries;
        if (userRole === 'Beneficiary') {
            filteredBeneficiaries = dummyData.beneficiaries.filter(b => b.id === 'ben001'); // Show only own record
        } else if (userRole === 'Volunteer') {
            filteredBeneficiaries = dummyData.beneficiaries.filter(b => b.assignedVolunteerId === 'vol001'); // Show beneficiaries assigned to this volunteer
        }
        // Project Manager should see beneficiaries linked to their projects
        // For simplicity, PM here can see all but in a real app would filter by projects they manage
        // if (userRole === 'Project Manager') {
        //     const managedProjects = dummyData.projects.filter(p => p.managerId === 'pm001').map(p => p.id);
        //     filteredBeneficiaries = dummyData.beneficiaries.filter(b => managedProjects.includes(b.projectId));
        // }


        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Beneficiaries</h2>
                    <div className="page-actions">
                        {hasAccess('beneficiary', 'create') && (
                            <button className="btn btn-primary" onClick={() => navigateTo('BeneficiaryForm')}><Icon name="Add" /> New Beneficiary</button>
                        )}
                        <button className="btn btn-secondary"><Icon name="Filter" /> Filter</button>
                        <button className="btn btn-secondary"><Icon name="Sort" /> Sort</button>
                    </div>
                </div>
                {filteredBeneficiaries.length > 0 ? (
                    <div className="card-grid">
                        {filteredBeneficiaries.map(beneficiary => (
                            <BeneficiaryCard key={beneficiary.id} beneficiary={beneficiary} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Beneficiaries" /></span>
                        <h3>No Beneficiaries Found</h3>
                        <p>There are no beneficiaries matching your criteria.</p>
                        {hasAccess('beneficiary', 'create') && (
                            <button className="btn btn-primary" onClick={() => navigateTo('BeneficiaryForm')}><Icon name="Add" /> Add Beneficiary</button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const DonorsList = () => {
        if (!hasAccess('donors')) {
            return (
                <div className="full-screen-page">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view donors.</p>
                </div>
            );
        }

        const filteredDonors = userRole === 'Donor' ? dummyData.donors.filter(d => d.id === 'don002') : dummyData.donors; // Example: don002 is the logged-in donor

        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Donors</h2>
                    <div className="page-actions">
                        {hasAccess('donor', 'create') && (
                            <button className="btn btn-primary" onClick={() => showToast('Donor creation form not implemented.', 'warning')}><Icon name="Add" /> New Donor</button>
                        )}
                        <button className="btn btn-secondary"><Icon name="Filter" /> Filter</button>
                        <button className="btn btn-secondary"><Icon name="Sort" /> Sort</button>
                    </div>
                </div>
                {filteredDonors.length > 0 ? (
                    <div className="card-grid">
                        {filteredDonors.map(donor => (
                            <DonorCard key={donor.id} donor={donor} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Donors" /></span>
                        <h3>No Donors Found</h3>
                        <p>There are no donors matching your criteria.</p>
                        {hasAccess('donor', 'create') && (
                            <button className="btn btn-primary" onClick={() => showToast('Donor creation form not implemented.', 'warning')}><Icon name="Add" /> Add Donor</button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const VolunteersList = () => {
        if (!hasAccess('volunteers')) {
            return (
                <div className="full-screen-page">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view volunteers.</p>
                </div>
            );
        }
        const filteredVolunteers = userRole === 'Volunteer' ? dummyData.volunteers.filter(v => v.id === 'vol001') : dummyData.volunteers;
        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Volunteers</h2>
                    <div className="page-actions">
                        {hasAccess('volunteer', 'create') && (
                            <button className="btn btn-primary" onClick={() => showToast('Volunteer creation form not implemented.', 'warning')}><Icon name="Add" /> New Volunteer</button>
                        )}
                        <button className="btn btn-secondary"><Icon name="Filter" /> Filter</button>
                        <button className="btn btn-secondary"><Icon name="Sort" /> Sort</button>
                    </div>
                </div>
                {filteredVolunteers.length > 0 ? (
                    <div className="card-grid">
                        {filteredVolunteers.map(volunteer => (
                            <VolunteerCard key={volunteer.id} volunteer={volunteer} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Volunteers" /></span>
                        <h3>No Volunteers Found</h3>
                        <p>There are no volunteers matching your criteria.</p>
                        {hasAccess('volunteer', 'create') && (
                            <button className="btn btn-primary" onClick={() => showToast('Volunteer creation form not implemented.', 'warning')}><Icon name="Add" /> Add Volunteer</button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const DonationsList = () => {
        if (!hasAccess('donations')) {
            return (
                <div className="full-screen-page">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view donations.</p>
                </div>
            );
        }
        const filteredDonations = userRole === 'Donor' ? dummyData.donations.filter(d => d.donorId === 'don002') : dummyData.donations;
        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Donations</h2>
                    <div className="page-actions">
                        {hasAccess('donation', 'create') && (
                            <button className="btn btn-primary" onClick={() => showToast('Donation creation form not implemented.', 'warning')}><Icon name="Add" /> New Donation</button>
                        )}
                        <button className="btn btn-secondary"><Icon name="Filter" /> Filter</button>
                        <button className="btn btn-secondary"><Icon name="Sort" /> Sort</button>
                    </div>
                </div>
                {filteredDonations.length > 0 ? (
                    <div className="card-grid">
                        {filteredDonations.map(donation => (
                            <DonationCard key={donation.id} donation={donation} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="Donations" /></span>
                        <h3>No Donations Found</h3>
                        <p>There are no donations matching your criteria.</p>
                        {hasAccess('donation', 'create') && (
                            <button className="btn btn-primary" onClick={() => showToast('Donation creation form not implemented.', 'warning')}><Icon name="Add" /> Record Donation</button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const ReportsScreen = () => {
        if (!hasAccess('reports')) {
            return (
                <div className="full-screen-page">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view reports.</p>
                </div>
            );
        }
        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Reports</h2>
                    <div className="page-actions">
                        <button className="btn btn-primary" onClick={() => showToast('Generate Custom Report (simulated)', 'info')}><Icon name="Add" /> Generate Report</button>
                    </div>
                </div>
                <div className="dashboard-charts-grid">
                    <ChartPlaceholder title="Funding Trends" type="Line" onExport={(type) => showToast(`Exporting Funding Trends to ${type}. (Simulated)`, 'info')} />
                    <ChartPlaceholder title="Beneficiary Demographics" type="Bar" onExport={(type) => showToast(`Exporting Beneficiary Demographics to ${type}. (Simulated)`, 'info')} />
                    <ChartPlaceholder title="Volunteer Activity Log" type="Table" onExport={(type) => showToast(`Exporting Volunteer Activity Log to ${type}. (Simulated)`, 'info')} />
                    <ChartPlaceholder title="Project Progress Summary" type="Gauge" onExport={(type) => showToast(`Exporting Project Progress Summary to ${type}. (Simulated)`, 'info')} />
                </div>
            </div>
        );
    };

    const AuditLogsScreen = () => {
        if (!hasAccess('auditLogs')) {
            return (
                <div className="full-screen-page">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view audit logs.</p>
                </div>
            );
        }
        const logs = dummyData.auditLogs.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)); // Most recent first
        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>Audit Logs</h2>
                    <div className="page-actions">
                        <button className="btn btn-secondary" onClick={() => showToast('Applying filters for audit logs (simulated)', 'info')}><Icon name="Filter" /> Filter</button>
                        <button className="btn btn-secondary" onClick={() => showToast('Exporting audit logs (simulated)', 'info')}><Icon name="File" /> Export</button>
                    </div>
                </div>
                {logs.length > 0 ? (
                    <div className="card-grid">
                        {logs.map(log => (
                            <AuditLogCard key={log.id} log={log} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><Icon name="History" /></span>
                        <h3>No Audit Logs</h3>
                        <p>No audit trail entries found.</p>
                    </div>
                )}
            </div>
        );
    };

    const UserProfileScreen = () => {
        let user;
        if (userRole === 'NGO Admin') user = { id: 'admin001', name: 'Admin User', email: 'admin@seva.org', role: 'NGO Admin' };
        else if (userRole === 'Project Manager') user = { id: 'pm001', name: 'Project Manager One', email: 'pm1@seva.org', role: 'Project Manager' };
        else if (userRole === 'Volunteer') user = dummyData.volunteers.find(v => v.id === 'vol001') || { id: 'vol001', name: 'Volunteer User', email: 'vol@seva.org', role: 'Volunteer' };
        else if (userRole === 'Donor') user = dummyData.donors.find(d => d.id === 'don002') || { id: 'don002', name: 'Donor User', email: 'donor@seva.org', role: 'Donor' };
        else if (userRole === 'Beneficiary') user = dummyData.beneficiaries.find(b => b.id === 'ben001') || { id: 'ben001', name: 'Beneficiary User', email: 'ben@seva.org', role: 'Beneficiary' };

        const handleEditProfile = () => {
            showToast('Editing profile (form not fully implemented for all roles, simulated)', 'info');
        };

        return (
            <div className="full-screen-page">
                <Breadcrumbs history={screenHistory} navigate={navigateTo} />
                <div className="page-header">
                    <h2>My Profile</h2>
                    <div className="page-actions">
                        <button className="btn btn-primary" onClick={handleEditProfile}><Icon name="Edit" /> Edit Profile</button>
                        <button className="btn btn-secondary" onClick={goBack}><Icon name="Back" /> Back</button>
                    </div>
                </div>
                <div className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="detail-item"><span className="detail-label">Name:</span> <span className="detail-value">{user.name}</span></div>
                    <div className="detail-item"><span className="detail-label">Email:</span> <span className="detail-value">{user.email}</span></div>
                    <div className="detail-item"><span className="detail-label">Role:</span> <span className="detail-value">{user.role}</span></div>
                    {user.skills && <div className="detail-item"><span className="detail-label">Skills:</span> <span className="detail-value">{user.skills.join(', ')}</span></div>}
                    {user.totalDonated && <div className="detail-item"><span className="detail-label">Total Donated:</span> <span className="detail-value">{formatCurrency(user.totalDonated)}</span></div>}
                    {user.location && <div className="detail-item"><span className="detail-label">Location:</span> <span className="detail-value">{user.location}</span></div>}
                </div>
            </div>
        );
    };

    // --- Main App Renderer ---
    const renderScreen = () => {
        switch (currentScreen) {
            case 'Dashboard':
                return <AdminDashboard />;
            case 'ProjectsList':
                return <ProjectsList />;
            case 'ProjectDetail':
                return <ProjectDetail projectId={selectedRecord} />;
            case 'ProjectForm':
                return <ProjectForm projectId={selectedRecord} />;
            case 'BeneficiariesList':
                return <BeneficiariesList />;
            case 'BeneficiaryDetail':
                return <BeneficiaryDetail beneficiaryId={selectedRecord} />;
            case 'BeneficiaryForm':
                return <BeneficiaryForm beneficiaryId={selectedRecord} />;
            case 'DonorsList':
                return <DonorsList />;
            case 'DonationsList':
                return <DonationsList />;
            case 'VolunteersList':
                return <VolunteersList />;
            case 'Reports':
                return <ReportsScreen />;
            case 'AuditLogs':
                return <AuditLogsScreen />;
            case 'AuditLogDetail':
                return <AuditLogDetail logId={selectedRecord} />;
            case 'UserProfile':
                return <UserProfileScreen />;
            default:
                return (
                    <div className="full-screen-page">
                        <h2>Welcome to SevaConnect!</h2>
                        <p>Select an option from the sidebar to get started.</p>
                    </div>
                );
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <div className="header-left">
                    <div className="app-logo">SevaConnect</div>
                    <div className="header-search">
                        <input type="text" placeholder="Global Search..." />
                    </div>
                </div>
                <div className="header-right">
                    <div className="role-switcher">
                        <select value={userRole} onChange={(e) => { setUserRole(e.target.value); navigateTo('Dashboard', null, true); }}>
                            {['NGO Admin', 'Project Manager', 'Volunteer', 'Donor', 'Beneficiary'].map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="user-profile">
                        <span className="user-name">{userRole}</span>
                        <div className="user-avatar" onClick={() => navigateTo('UserProfile')}>
                            {userRole.charAt(0)}
                        </div>
                    </div>
                </div>
            </header>

            <aside className="sidebar">
                <nav className="sidebar-nav">
                    <ul>
                        {hasAccess('dashboard') && (
                            <li>
                                <a href="#" className={currentScreen === 'Dashboard' ? 'active' : ''} onClick={() => navigateTo('Dashboard')}>
                                    <Icon name="Dashboard" /> Dashboard
                                </a>
                            </li>
                        )}
                        {hasAccess('projects') && (
                            <li>
                                <a href="#" className={currentScreen === 'ProjectsList' || currentScreen === 'ProjectDetail' || currentScreen === 'ProjectForm' ? 'active' : ''} onClick={() => navigateTo('ProjectsList')}>
                                    <Icon name="Projects" /> Projects
                                </a>
                            </li>
                        )}
                        {hasAccess('beneficiaries') && (
                            <li>
                                <a href="#" className={currentScreen === 'BeneficiariesList' || currentScreen === 'BeneficiaryDetail' || currentScreen === 'BeneficiaryForm' ? 'active' : ''} onClick={() => navigateTo('BeneficiariesList')}>
                                    <Icon name="Beneficiaries" /> Beneficiaries
                                </a>
                            </li>
                        )}
                        {hasAccess('donors') && (
                            <li>
                                <a href="#" className={currentScreen === 'DonorsList' ? 'active' : ''} onClick={() => navigateTo('DonorsList')}>
                                    <Icon name="Donors" /> Donors
                                </a>
                            </li>
                        )}
                        {hasAccess('volunteers') && (
                            <li>
                                <a href="#" className={currentScreen === 'VolunteersList' ? 'active' : ''} onClick={() => navigateTo('VolunteersList')}>
                                    <Icon name="Volunteers" /> Volunteers
                                </a>
                            </li>
                        )}
                        {hasAccess('donations') && (
                            <li>
                                <a href="#" className={currentScreen === 'DonationsList' ? 'active' : ''} onClick={() => navigateTo('DonationsList')}>
                                    <Icon name="Donations" /> Funds
                                </a>
                            </li>
                        )}
                        {hasAccess('reports') && (
                            <li>
                                <a href="#" className={currentScreen === 'Reports' ? 'active' : ''} onClick={() => navigateTo('Reports')}>
                                    <Icon name="Reports" /> Reports
                                </a>
                            </li>
                        )}
                        {hasAccess('auditLogs') && (
                            <li>
                                <a href="#" className={currentScreen === 'AuditLogs' || currentScreen === 'AuditLogDetail' ? 'active' : ''} onClick={() => navigateTo('AuditLogs')}>
                                    <Icon name="History" /> Audit Logs
                                </a>
                            </li>
                        )}
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <button className="btn btn-outline" onClick={() => showToast('Logging out... (simulated)', 'info')}><Icon name="Logout" /> Logout</button>
                </div>
            </aside>

            <main className="main-content">
                {renderScreen()}
            </main>

            <div className="toast-container">
                {notifications.map(n => (
                    <ToastNotification key={n.id} message={n.message} type={n.type} id={n.id} />
                ))}
            </div>
        </div>
    );
}

export default function AppWrapper() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}