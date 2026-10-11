import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import LoadingOverlay from './components/LoadingOverlay';
import ReviewModal from './components/ReviewModal';

import DashboardView from './views/DashboardView';
import NewClaimView from './views/NewClaimView';
import ClaimsView from './views/ClaimsView';
import ClaimDetailView from './views/ClaimDetailView';
import PolicyView from './views/PolicyView';
import HistoryView from './views/HistoryView';

import { api } from './api';
import { CATEGORY_LIMITS } from './policyData';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaimId, setSelectedClaimId] = useState(null);

  const [claims, setClaims] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  const [toasts, setToasts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null);

  const addToast = useCallback((type, title, message = '', duration = 4000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, statsRes, claimsRes, logsRes] = await Promise.allSettled([
        api.getStatus(),
        api.getDashboardStats(),
        api.getClaims(),
        api.getAuditLogs(),
      ]);

      if (statusRes.status === 'fulfilled') {
        setDbStatus(statusRes.value.database);
        setAiStatus(statusRes.value.ai);
      }
      if (statsRes.status === 'fulfilled') {
        setDashboardStats(statsRes.value);
      }
      if (claimsRes.status === 'fulfilled') {
        setClaims(claimsRes.value.claims || []);
      }
      if (logsRes.status === 'fulfilled') {
        setAuditLogs(logsRes.value.auditLogs || []);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenClaim = (claimId) => {
    setSelectedClaimId(claimId);
    setCurrentView('claim-detail');
  };

  const handleSubmitClaim = async (formData) => {
    setIsSubmitting(true);
    try {
      const created = await api.submitClaim(formData);
      addToast('success', 'Claim Submitted', `Claim ${created.id} was processed and analyzed.`);
      await loadData();
      setSelectedClaimId(created.id);
      setCurrentView('claim-detail');
    } catch (err) {
      addToast('error', 'Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRerunAi = async (claimId) => {
    setIsAnalyzing(true);
    try {
      await api.rerunAiAnalysis(claimId);
      addToast('success', 'Analysis Updated', 'Policy evaluation updated for this claim.');
      await loadData();
    } catch (err) {
      addToast('error', 'Analysis Failed', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenModal = (action, claim) => {
    setReviewModalData({ action, claim });
  };

  const handleConfirmReviewAction = async ({ claimId, action, reviewer, note, overrideCategory }) => {
    try {
      await api.executeReviewAction(claimId, { action, reviewer, note, overrideCategory });
      setReviewModalData(null);
      addToast('success', 'Action Applied', `Claim ${claimId} was successfully updated.`);
      await loadData();
    } catch (err) {
      addToast('error', 'Action Failed', err.message);
    }
  };

  const activeClaim = claims.find((c) => c.id === selectedClaimId);

  return (
    <div className="flex min-h-screen bg-dark-900 text-neutral-100 font-sans selection:bg-brand selection:text-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <LoadingOverlay isLoading={isSubmitting || isAnalyzing} message="Analyzing claim against policy..." />

      {reviewModalData && (
        <ReviewModal
          modalData={reviewModalData}
          onClose={() => setReviewModalData(null)}
          onConfirm={handleConfirmReviewAction}
        />
      )}

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        dbStatus={dbStatus}
        aiStatus={aiStatus}
      />

      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-12 max-w-7xl mx-auto w-full">
        {currentView === 'dashboard' && (
          <DashboardView
            stats={dashboardStats}
            onNavigate={setCurrentView}
            onOpenClaim={handleOpenClaim}
          />
        )}

        {currentView === 'new-claim' && (
          <NewClaimView
            onSubmit={handleSubmitClaim}
            isSubmitting={isSubmitting}
          />
        )}

        {currentView === 'claims' && (
          <ClaimsView
            claims={claims}
            onNavigate={setCurrentView}
            onOpenClaim={handleOpenClaim}
          />
        )}

        {currentView === 'claim-detail' && activeClaim && (
          <ClaimDetailView
            claim={activeClaim}
            onBack={() => setCurrentView('claims')}
            onOpenModal={handleOpenModal}
            onRerunAi={handleRerunAi}
            isAnalyzing={isAnalyzing}
            categoryLimits={CATEGORY_LIMITS}
          />
        )}

        {currentView === 'policy' && <PolicyView />}

        {currentView === 'history' && <HistoryView auditLogs={auditLogs} />}
      </main>
    </div>
  );
}
