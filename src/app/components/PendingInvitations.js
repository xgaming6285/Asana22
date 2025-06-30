"use client";

import { useState, useEffect } from "react";
import { Button } from "./MaterialTailwind";
import { ArrowPathIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import membershipService from "../services/membershipService";

export default function PendingInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingInvites, setProcessingInvites] = useState({});
  const [actionErrors, setActionErrors] = useState({});

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await membershipService.getUserInvitations();
      setInvitations(data);
    } catch (err) {
      console.error("Error loading invitations:", err);
      setError(err.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleInvitation = async (inviteId, action) => {
    setProcessingInvites((prev) => ({ ...prev, [inviteId]: true }));
    setActionErrors((prev) => ({ ...prev, [inviteId]: null }));

    try {
      if (action === "accept") {
        await membershipService.acceptInvitation(inviteId);
      } else {
        await membershipService.rejectInvitation(inviteId);
      }
      // Remove the processed invitation from the list
      setInvitations((prev) =>
        prev.filter((invitation) => invitation.id !== inviteId)
      );
      setActionErrors((prev) => ({ ...prev, [inviteId]: null }));
    } catch (err) {
      console.error(`Failed to ${action} invitation:`, err);
      setActionErrors((prev) => ({
        ...prev,
        [inviteId]: err.message || `Failed to ${action} invitation`,
      }));
    } finally {
      setProcessingInvites((prev) => ({ ...prev, [inviteId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-900/20 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-gray-400 text-center py-6 sm:py-8">
        <p className="text-base sm:text-lg">No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="bg-gray-700 sm:bg-gray-800 rounded-lg p-3 sm:p-4 space-y-3"
        >
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-white truncate">
                {invitation.project.name}
              </h3>
              <p className="text-sm text-gray-400">Role: {invitation.role}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                size="sm"
                variant="filled"
                color="green"
                className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2 px-3 w-full sm:w-auto"
                onClick={() => handleInvitation(invitation.id, "accept")}
                disabled={processingInvites[invitation.id]}
              >
                {processingInvites[invitation.id] ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Accept</span>
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outlined"
                color="red"
                className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2 px-3 w-full sm:w-auto"
                onClick={() => handleInvitation(invitation.id, "reject")}
                disabled={processingInvites[invitation.id]}
              >
                {processingInvites[invitation.id] ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <XMarkIcon className="w-4 h-4" />
                    <span>Reject</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          {actionErrors[invitation.id] && (
            <div className="text-red-400 bg-red-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm leading-relaxed">
              {actionErrors[invitation.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
