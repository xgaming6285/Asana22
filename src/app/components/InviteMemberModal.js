"use client";

import { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext";
import {
  XMarkIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import membershipService from "../services/membershipService";

const PROJECT_ROLES = {
  ADMIN: "Administrator",
  USER: "Team Member",
};

export default function InviteMemberModal() {
  const { isOpen, closeModal, modalProps } = useModal();
  const projectId = modalProps?.projectId;
  const isInviteModal = modalProps?.type === "invite";

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [signalPhone, setSignalPhone] = useState("");
  const [signalApiKey, setSignalApiKey] = useState("");
  const [enableSignal, setEnableSignal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  useEffect(() => {
    if (isOpen && isInviteModal) {
      setEmail("");
      setRole("USER");
      setSignalPhone("");
      setSignalApiKey("");
      setEnableSignal(false);
      setError("");
    }
  }, [isOpen, isInviteModal]);

  const handleInvite = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const inviteData = {
        email: email.trim(),
        role,
      };

      // Add Signal data if enabled
      if (enableSignal && signalPhone.trim() && signalApiKey.trim()) {
        inviteData.signalPhone = signalPhone.trim();
        inviteData.signalApiKey = signalApiKey.trim();
      }

      await membershipService.inviteUserToProject(projectId, inviteData);
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !isInviteModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transform transition-all duration-300">
          <div className="flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <UserPlusIcon className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-xl font-semibold text-slate-100">
                    Invite Team Member
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Email Address <span className="text-slate-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200"
                    placeholder="colleague@company.com"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Role Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Role
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRoleOpen(!isRoleOpen)}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-left text-slate-100 flex items-center justify-between hover:border-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    >
                      <span>{PROJECT_ROLES[role]}</span>
                      <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                    </button>
                    {isRoleOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                        {Object.entries(PROJECT_ROLES).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setRole(value);
                              setIsRoleOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-slate-100 hover:bg-slate-700 transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Signal Integration */}
                <div className="space-y-4 border-t border-slate-700/50 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300">Signal Notification</h4>
                      <p className="text-xs text-slate-500 mt-1">Also send invitation via Signal messenger</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableSignal(!enableSignal)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enableSignal ? 'bg-indigo-600' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enableSignal ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {enableSignal && (
                    <div className="space-y-4 pl-4 border-l-2 border-indigo-500/30">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Signal Phone/Username
                        </label>
                        <input
                          type="text"
                          value={signalPhone}
                          onChange={(e) => setSignalPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200"
                          placeholder="+1234567890 or username"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          CallMeBot API Key
                        </label>
                        <input
                          type="text"
                          value={signalApiKey}
                          onChange={(e) => setSignalApiKey(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200"
                          placeholder="Your CallMeBot API key"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          📱 To get your API key: Add <strong>+34 644 52 74 88</strong> to your contacts, 
                          then send &quot;I allow callmebot to send me messages&quot; via Signal.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={isSubmitting}
                  className={`
                    px-6 py-2 rounded-lg
                    bg-gradient-to-r from-indigo-600 to-indigo-700
                    hover:from-indigo-500 hover:to-indigo-600
                    active:from-indigo-700 active:to-indigo-800
                    text-white font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    min-w-[100px]
                    flex items-center justify-center
                  `}
                >
                  {isSubmitting ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    "Send Invite"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
