// ParticipantList.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backend_url } from "../../../../backend_route";
import { apiResponse, getWithExpirationCheck } from "../../../../Helpers/Helpers";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  project_enroll_status:
    | "approved"
    | "rejected"
    | "completed"
    | "proof-submitted"
    | "rejected_by_admin";
  serviceType: string;
  enrollmentDate: string;
  location: string;
  creditsEarned?: number;
  creditsAllocated?: number;
  email?: string;
  participant_id: string;
}

interface ParticipantListProps {
  participants: Participant[];
  viewMode: "grid" | "list";
  setSelectedParticipant: (participant: Participant | null) => void;
  setShowViewModal: (value: boolean) => void;
  setUpdateFormData: (data: { credits?: string; remarks: string }) => void;
  setShowUpdateModal: (value: boolean) => void;
  selectedParticipant: Participant | null;
  fetchParticipant: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "proof-submitted":
      return "bg-indigo-100 text-indigo-800";
    case "rejected_by_admin":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  viewMode,
  setSelectedParticipant,
  setShowViewModal,
  setUpdateFormData,
  setShowUpdateModal,
  fetchParticipant,
}) => {
  //@ts-ignore
  const navigate = useNavigate();
  const formatStandardDate = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [participantToReject, setParticipantToReject] = useState<Participant | null>(null);

  const handleEnrollmentAction = async (
    enrollmentId: string,
    action: "approved" | "rejected",
    remark?: string
  ) => {
    try {
      const token = getWithExpirationCheck("token");
      const payload: any = {
        enrollment_id: enrollmentId,
        status: action,
      };
      if (action === "rejected" && remark) {
        payload.remark = remark;
      }
      const response = await axios.put(
        `${backend_url}/enroll/approve-reject`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        apiResponse(`Enrollment ${action} successfully`, "bg-green-500");
        fetchParticipant();
      }
    } catch (error) {
      console.error(`Failed to ${action} enrollment:`, error);
      apiResponse(`Failed to ${action} enrollment`, "bg-red-500");
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectRemark.trim()) {
      apiResponse("Remark is required to reject", "bg-red-500");
      return;
    }
    if (participantToReject) {
      await handleEnrollmentAction(participantToReject.id, "rejected", rejectRemark);
      setShowRejectModal(false);
      setRejectRemark("");
      setParticipantToReject(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {participant.name ?? "Humaira"}
                  </h3>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      participant.project_enroll_status
                    )}`}
                  >
                    {participant.project_enroll_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {participant.serviceType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">
                    {participant.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrollment Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatStandardDate(participant.enrollmentDate)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "S.No",
                    "Participant",
                    "Area",
                    "Project",
                    "Status",
                    "Credits Earned",
                    "Credits Allocated",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant, index) => (
                  <tr
                    key={participant.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedParticipant(participant)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={participant.avatar}
                          alt={participant.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-blue-600 group-hover:text-blue-800">
                            {participant.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {participant.email ||
                              `${participant.id}@ecoedu.com`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {participant.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {participant.serviceType}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          participant.project_enroll_status
                        )}`}
                      >
                        {participant.project_enroll_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                      {participant.creditsEarned ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {participant.creditsAllocated ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2 items-center">
                        {(participant.project_enroll_status === "approved" ||
                          participant.project_enroll_status === "rejected") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParticipant(participant);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                        {participant.project_enroll_status === "approved" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParticipant(participant);
                              setUpdateFormData({
                                credits:
                                  participant.creditsAllocated?.toString() ||
                                  "",
                                remarks: "",
                              });
                              setShowUpdateModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Submit Proof"
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                        )}
                        {participant.project_enroll_status === "rejected" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnrollmentAction(
                                participant.id,
                                "approved"
                              );
                            }}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                        )}
                        {participant.project_enroll_status ===
                          "proof-submitted" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParticipant(participant);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                        {(participant.project_enroll_status === "completed" ||
                          participant.project_enroll_status === "rejected_by_admin") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParticipant(participant);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                        {participant.project_enroll_status !== "approved" &&
                          participant.project_enroll_status !== "rejected" &&
                          participant.project_enroll_status !==
                            "proof-submitted" &&
                          participant.project_enroll_status !== "completed" &&
                          participant.project_enroll_status !==
                            "rejected_by_admin" && (
                            <>
                              <button
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEnrollmentAction(
                                    participant.id,
                                    "approved"
                                  );
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setParticipantToReject(participant);
                                  setShowRejectModal(true);
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Enter Remark to Reject</h2>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows={4}
              placeholder="Enter reason for rejection"
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectRemark("");
                  setParticipantToReject(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleRejectConfirm}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;
