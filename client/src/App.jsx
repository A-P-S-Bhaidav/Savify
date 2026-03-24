import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { CapacitorHttp } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';
import { useAuth } from './hooks/useAuth';
import { supabase } from './config/supabase';

// Page Imports
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import FeedbackPage from './pages/FeedbackPage';
import WaitlistPage from './pages/WaitlistPage';
import AnalysisPage from './pages/AnalysisPage';
import BalanceScorePage from './pages/BalanceScorePage';
import BrokePage from './pages/BrokePage';
import ChallengePage from './pages/ChallengePage';
import CompetitionPage from './pages/CompetitionPage';
import LeaderboardPage from './pages/LeaderboardPage';
import RealityPage from './pages/RealityPage';
import SomethingPage from './pages/SomethingPage';
import StatusTiersPage from './pages/StatusTiersPage';
import TimerPage from './pages/TimerPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import ExtraPolicyPage from './pages/ExtraPolicyPage';
import DeepDivePage from './pages/DeepDivePage'; // <-- Added from coder's version

const SUPABASE_URL = 'https://zipowqnjznngzyxdtxwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcG93cW5qem5uZ3p5eGR0eHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzEyNTQsImV4cCI6MjA4MzI0NzI1NH0.6OKydmyzpbtyWG7GzTSnXwudwBABsFVWiNfX4G7II3g';

/**
 * 🔒 GLOBAL LOCK
 */
let widgetSyncLock = false;

// <-- Added ScrollToTop from coder's version -->
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Protected Route (Updated with coder's styling)
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f4' }}>
        <div className="spinner"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  const checkWidgetData = async () => {
    // 1. Check if locked
    if (widgetSyncLock || !user) return;
    
    // 2. ⚡ LOCK IMMEDIATELY (Synchronously) ⚡
    // Do this BEFORE any 'await' so nothing else can slip through the gap!
    widgetSyncLock = true;
    
    try {
      // 3. Now we can safely check storage
      const { value: hasNewData } = await Preferences.get({ key: 'has_new_data' });
      
      if (hasNewData !== 'true') {
        widgetSyncLock = false; // Unlock if nothing to do
        return;
      }

      // Wipe storage flag
      await Preferences.set({ key: 'has_new_data', value: 'false' });

      const { value: amount } = await Preferences.get({ key: 'last_amount' });
      const { value: category } = await Preferences.get({ key: 'last_category' });

      if (!amount) {
        widgetSyncLock = false;
        return;
      }

      console.log(`🚀 Syncing Widget Data: ₹${amount}...`);

      const response = await CapacitorHttp.post({
        url: `${SUPABASE_URL}/rest/v1/expenses`,
        headers: { 
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal' 
        },
        data: { 
          amount: parseFloat(amount), 
          category: category, 
          user_id: user.id 
        },
      });

      if (response.status === 201 || response.status === 200) {
        console.log("✅ SUCCESS: Row created.");
      }
    } catch (err) { 
      console.error("❌ Sync Error:", err); 
    } finally {
      // 4. Release lock ONLY after network is completely finished
      widgetSyncLock = false;
    }
  };

  useEffect(() => {
    let urlListenerHandle;
    let stateListenerHandle;

    const setupListeners = async () => {
      // Your exact working listener for Deep Links & Auth
      urlListenerHandle = await CapacitorApp.addListener('appUrlOpen', async (event) => {
        await Browser.close(); 
        if (event.url && event.url.includes('#')) {
          const fragment = event.url.split('#')[1];
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          if (accessToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: params.get('refresh_token') });
          }
        }
      });

      stateListenerHandle = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive && user) checkWidgetData();
      });

      // OneSignal Initialization
      try {
        if (Capacitor.isNativePlatform()) {
          OneSignal.initialize("661f2d7e-5a6f-4b03-aea0-2f0fe7b5e344");
          OneSignal.Notifications.requestPermission(true).then((accepted) => {
            console.log("User accepted OneSignal notifications:", accepted);
          });
        }
      } catch (err) {
        console.error("OneSignal Setup Error:", err);
      }
    };

    setupListeners();

    if (user) checkWidgetData();

    return () => {
      if (urlListenerHandle) urlListenerHandle.remove();
      if (stateListenerHandle) stateListenerHandle.remove();
    };
  }, [user]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard.html" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/deep-dive" element={<ProtectedRoute><DeepDivePage /></ProtectedRoute>} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/balance-score" element={<BalanceScorePage />} />
        <Route path="/broke" element={<BrokePage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/competition" element={<CompetitionPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/reality" element={<RealityPage />} />
        <Route path="/something" element={<SomethingPage />} />
        <Route path="/status-tiers" element={<StatusTiersPage />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/extra-policy" element={<ExtraPolicyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}