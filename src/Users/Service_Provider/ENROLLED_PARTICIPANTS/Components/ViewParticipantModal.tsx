import React, { useState, useEffect } from "react";
import axios from "axios";
import { backend_url } from "../../../../backend_route";
import { formatDate, getWithExpirationCheck } from "../../../../Helpers/Helpers";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  project_enroll_status: string;
  serviceType: string;
  enrollmentDate: string;
  location: string;
  creditsEarned?: number;
  creditsAllocated?: number;
  email?: string;
  proofImage?: string; // Single image URL
  proofVideo?: string; // Single video URL
  proofId?: string;
}

interface ViewParticipantModalProps {
  selectedParticipant: Participant | null;
  showViewModal: boolean;
  setShowViewModal: (value: boolean) => void;
  setShowUpdateModal: (value: boolean) => void;
  setUpdateFormData: (data: { credits: string; remarks: string }) => void;
  projectId: string;
}

const ViewParticipantModal: React.FC<ViewParticipantModalProps> = ({
  selectedParticipant,
  showViewModal,
  setShowViewModal,
  projectId,
  // setShowUpdateModal,
  // setUpdateFormData,
}) => {
  if (!showViewModal || !selectedParticipant) return null;
  const [proofData, setProofData] = useState<{
    proofImage?: string;
    proofVideo?: string;
    proofId?: string;
  }>({});

  useEffect(() => {
    if (showViewModal && selectedParticipant) {
      fetchProofs();
    }
  }, [showViewModal, selectedParticipant]);

  const fetchProofs = async () => {
    try {
      const response = await axios.get(
        `${backend_url}/serviceProviders/proofs/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${getWithExpirationCheck("token")}`,
          }, // Adjust token handling if needed
        }
      );

      if (response.data.success) {
        const participantProof = response.data.data.find(
          (proof: any) => proof.email === selectedParticipant.email
        );

        if (participantProof) {
          setProofData({
            proofImage:
              participantProof.image_url || participantProof.image_path,
            proofVideo:
              participantProof.video_url || participantProof.video_path,
            // proofId:
            // participantProof.proofId || participantProof.proofId,
            proofId: participantProof.id,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching proofs:", error);
    }
  };

  // @ts-ignore
  const handleSendToAdmin = async (proofId: string) => {
    try {
      const token = getWithExpirationCheck("token");
      const response = await axios.post(
        `${backend_url}/serviceProviders/proofs/${proofId}/send-to-admin`,
        { proofId }, // Sending proofId to the backend
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass Bearer token
          },
        }
      );

      if (response.status === 200) {
        // alert("Proof sent to admin successfully");
        const successDiv = document.createElement("div");
        successDiv.className =
          "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up";
        successDiv.textContent = "Proof sent to admin successfully";
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
        // Optionally, you could refresh the list or update the UI accordingly
      }
    } catch (error) {
      // console.error("Failed to send proof to admin:", error);
      // alert("Failed to send proof to admin");
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up";
      successDiv.textContent = "Proof already submitted";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90vw] sm:w-[600px] lg:w-[800px] max-h-[80vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Participant Details
          </h2>
          <button
            onClick={() => setShowViewModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={selectedParticipant.avatar}
              alt={selectedParticipant.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedParticipant.name}
              </h3>
              <p className="text-gray-500">{selectedParticipant.email}</p>
            </div>
          </div>

          {/* Participant Info */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedParticipant.project_enroll_status === "approved"
                    ? "bg-green-100 text-green-800"
                    : selectedParticipant.project_enroll_status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : selectedParticipant.project_enroll_status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : selectedParticipant.project_enroll_status ===
                      "proof-submitted"
                    ? "bg-indigo-100 text-indigo-800"
                    : selectedParticipant.project_enroll_status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : selectedParticipant.project_enroll_status ===
                      "rejected_by_admin"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-500 text-white" // default if none match
                }`}
              >
                {selectedParticipant.project_enroll_status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Service Type</p>
              <p className="text-sm font-medium text-gray-900">
                {selectedParticipant.serviceType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrollment Date</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(selectedParticipant.enrollmentDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-sm font-medium text-gray-900">
                {selectedParticipant.location}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Credits Earned</p>
              <p className="text-sm font-medium text-gray-900">
                {selectedParticipant.creditsEarned ?? "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Credits Allocated</p>
              <p className="text-sm font-medium text-gray-900">
                {selectedParticipant.creditsAllocated ?? "N/A"}
              </p>
            </div>
          </div>

          {/* Submitted Proofs */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Submitted Proof
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Display Proof Image */}
              {proofData.proofImage ? (
                <img
                  src={proofData.proofImage}
                  alt="Proof"
                  className="rounded-lg w-full h-48 object-cover"
                />
              ) : (
                <p className="text-gray-500 text-sm col-span-2">
                  No Image Proof Available
                </p>
              )}

              {/* Display Proof Video */}
              {proofData.proofVideo ? (
                <video controls className="rounded-lg w-full h-48 object-cover">
                  <source src={proofData.proofVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p className="text-gray-500 text-sm col-span-2">
                  No Video Proof Available
                </p>
              )}
              {selectedParticipant.project_enroll_status ===
                "proof-submitted" && (
                <button
                  onClick={() => {
                    if (proofData.proofId) {
                      console.log("proof id : ", proofData.proofId);
                      // handleSendToAdmin(proofData.proofId);
                    } else {
                      const successDiv = document.createElement("div");
                      successDiv.className =
                        "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up";
                      successDiv.textContent =
                        "Proof not found, submit the proof first!";
                      document.body.appendChild(successDiv);
                      setTimeout(() => successDiv.remove(), 3000);
                    }
                  }}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Edit Proof
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewParticipantModal;
