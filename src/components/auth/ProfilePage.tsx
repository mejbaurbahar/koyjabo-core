import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, AtSign, Shield, Camera, Loader2, AlertCircle, CheckCircle2,
  Clock, Monitor, Smartphone, Tablet, LogOut, Eye, EyeOff, ChevronRight,
  ArrowLeft, Trash2, Key, Edit3, Save, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  updateProfile, changePassword, uploadAvatar,
  fetchDevices, logoutDevice, getOrCreateDeviceId
} from '../../services/githubAuthService';
import type { Device } from '../../types/auth';

interface ProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
}

// ── Async operation UI states ─────────────────────────────────────────────────
type OpState = 'idle' | 'loading' | 'success' | 'error';

function useAsyncOp() {
  const [state, setState] = useState<OpState>('idle');
  const [message, setMessage] = useState('');
  const run = async (fn: () => Promise<void>) => {
    setState('loading');
    setMessage('');
    try {
      await fn();
      setState('success');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'কিছু সমস্যা হয়েছে।');
    }
    setTimeout(() => setState('idle'), 3000);
  };
  return { state, message, run };
}

// ── Device icon ───────────────────────────────────────────────────────────────
function DeviceIcon({ type }: { type: Device['deviceType'] }) {
  const cls = 'text-gray-500 dark:text-gray-400';
  if (type === 'mobile') return <Smartphone size={20} className={cls} />;
  if (type === 'tablet') return <Tablet size={20} className={cls} />;
  return <Monitor size={20} className={cls} />;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Processing overlay ────────────────────────────────────────────────────────
function ProcessingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
          <Clock className="absolute inset-0 m-auto text-blue-600" size={18} />
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">সর্বোচ্চ ৯০ সেকেন্ড…</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfilePage({ onBack, onLogout }: ProfilePageProps) {
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'devices'>('profile');

  // Profile edit
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const profileOp = useAsyncOp();

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const passwordOp = useAsyncOp();

  // Avatar
  const [avatarProcessing, setAvatarProcessing] = useState(false);

  // Device logout
  const [loggingOutDevice, setLoggingOutDevice] = useState<string | null>(null);

  // Load devices when section is opened
  useEffect(() => {
    if (activeSection === 'devices' && user && devices.length === 0) {
      setDevicesLoading(true);
      fetchDevices(user.id)
        .then(setDevices)
        .catch(() => {})
        .finally(() => setDevicesLoading(false));
    }
  }, [activeSection, user, devices.length]);

  if (!user) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSaveProfile = () =>
    profileOp.run(async () => {
      const result = await updateProfile(user.id, editName, editUsername);
      if (!result.success) throw new Error(result.error);
      updateUser({ displayName: result.displayName!, username: result.username! });
      setEditMode(false);
    });

  const handleChangePassword = () =>
    passwordOp.run(async () => {
      if (pwForm.newPass.length < 8) throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      if (pwForm.newPass !== pwForm.confirm) throw new Error('পাসওয়ার্ড মিলছে না।');
      const result = await changePassword(user.id, user.email, pwForm.current, pwForm.newPass);
      if (!result.success) throw new Error(result.error);
      setPwForm({ current: '', newPass: '', confirm: '' });
    });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setAvatarProcessing(true);
    try {
      const result = await uploadAvatar(user.id, file);
      if (!result.success) throw new Error(result.error);
      // Re-fetch avatar URL
      const { fetchAvatar } = await import('../../services/githubAuthService');
      const newUrl = await fetchAvatar(user.id);
      if (newUrl) updateUser({ avatarUrl: newUrl });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setAvatarProcessing(false);
    }
  };

  const handleLogoutDevice = async (deviceId: string) => {
    setLoggingOutDevice(deviceId);
    try {
      const result = await logoutDevice(user.id, deviceId);
      if (!result.success) throw new Error(result.error);
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      if (deviceId === getOrCreateDeviceId()) {
        logout();
        onLogout();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ডিভাইস লগআউট ব্যর্থ হয়েছে।');
    } finally {
      setLoggingOutDevice(null);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Processing overlays */}
      {profileOp.state === 'loading' && <ProcessingOverlay message="প্রোফাইল আপডেট হচ্ছে…" />}
      {passwordOp.state === 'loading' && <ProcessingOverlay message="পাসওয়ার্ড পরিবর্তন হচ্ছে…" />}
      {avatarProcessing && <ProcessingOverlay message="ছবি আপলোড হচ্ছে…" />}
      {loggingOutDevice && <ProcessingOverlay message="ডিভাইস লগআউট হচ্ছে…" />}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex-1">আমার প্রোফাইল</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut size={16} />
            লগআউট
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Avatar + name card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{user.displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shadow-md hover:bg-blue-700 transition"
              >
                <Camera size={13} className="text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{user.displayName}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">@{user.username}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-slate-700">
          {[
            { key: 'profile', label: 'প্রোফাইল', Icon: User },
            { key: 'security', label: 'পাসওয়ার্ড', Icon: Shield },
            { key: 'devices', label: 'ডিভাইস', Icon: Monitor }
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as typeof activeSection)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition ${
                activeSection === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── PROFILE SECTION ── */}
        {activeSection === 'profile' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">প্রোফাইল তথ্য</h3>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <Edit3 size={15} /> সম্পাদনা
                </button>
              ) : (
                <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Feedback */}
              {profileOp.state === 'success' && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <p className="text-sm text-green-700 dark:text-green-400">প্রোফাইল আপডেট হয়েছে!</p>
                </div>
              )}
              {profileOp.state === 'error' && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-400">{profileOp.message}</p>
                </div>
              )}

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <User size={14} /> পুরো নাম
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl">{user.displayName}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <AtSign size={14} /> ইউজারনেম
                </label>
                {editMode ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl">@{user.username}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} /> ইমেইল <span className="text-xs text-gray-400">(পরিবর্তনযোগ্য নয়)</span>
                </label>
                <p className="text-gray-700 dark:text-gray-300 px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl">{user.email}</p>
              </div>

              {editMode && (
                <button
                  onClick={handleSaveProfile}
                  disabled={!editName.trim() || !editUsername.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  সংরক্ষণ করুন
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── SECURITY SECTION ── */}
        {activeSection === 'security' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Key size={18} className="text-blue-600" /> পাসওয়ার্ড পরিবর্তন
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {passwordOp.state === 'success' && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <p className="text-sm text-green-700 dark:text-green-400">পাসওয়ার্ড পরিবর্তন হয়েছে!</p>
                </div>
              )}
              {passwordOp.state === 'error' && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-400">{passwordOp.message}</p>
                </div>
              )}

              {[
                { key: 'current', label: 'বর্তমান পাসওয়ার্ড', placeholder: '••••••••', autoComplete: 'current-password' },
                { key: 'newPass', label: 'নতুন পাসওয়ার্ড', placeholder: 'কমপক্ষে ৮ অক্ষর', autoComplete: 'new-password' },
                { key: 'confirm', label: 'নতুন পাসওয়ার্ড নিশ্চিত করুন', placeholder: '••••••••', autoComplete: 'new-password' }
              ].map(({ key, label, placeholder, autoComplete }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={pwForm[key as keyof typeof pwForm]}
                      onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    {key === 'current' && (
                      <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={handleChangePassword}
                disabled={!pwForm.current || !pwForm.newPass || !pwForm.confirm}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2"
              >
                <Shield size={16} />
                পাসওয়ার্ড পরিবর্তন করুন
              </button>
            </div>
          </div>
        )}

        {/* ── DEVICES SECTION ── */}
        {activeSection === 'devices' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Monitor size={18} className="text-blue-600" /> লগইন ডিভাইস সমূহ
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">আপনার অ্যাকাউন্টে সক্রিয় ডিভাইসের তালিকা</p>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-slate-700">
              {devicesLoading ? (
                <div className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">ডিভাইস তালিকা লোড হচ্ছে…</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                  <Monitor size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">এখনো কোনো ডিভাইস রেকর্ড নেই।<br />পরবর্তী লগইনের পর এখানে দেখা যাবে।</p>
                </div>
              ) : (
                devices.map(device => (
                  <div key={device.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <DeviceIcon type={device.deviceType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{device.name}</span>
                        {device.isCurrent && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                            এই ডিভাইস
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{device.os} • {device.browser}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        IP: {device.ip} • সর্বশেষ: {formatDate(device.lastLogin)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        প্রথম লগইন: {formatDate(device.firstLogin)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const msg = device.isCurrent
                          ? 'এই ডিভাইস থেকে লগআউট করবেন? আপনাকে আবার লগইন করতে হবে।'
                          : 'এই ডিভাইস থেকে লগআউট করতে চান?';
                        if (window.confirm(msg)) handleLogoutDevice(device.id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition shrink-0"
                      title="এই ডিভাইস থেকে লগআউট"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {devices.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ⚠️ অপরিচিত ডিভাইস দেখলে সেটি থেকে লগআউট করুন এবং পাসওয়ার্ড পরিবর্তন করুন।
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
