import { CloseIcon } from "./Icons";

interface NSFWWarningModalProps {
  onProceed: () => void;
  onGoBack: () => void;
}

export default function NSFWWarningModal({
  onProceed,
  onGoBack,
}: NSFWWarningModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg w-full max-w-sm p-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            Age Verification Required
          </h2>
          <button
            onClick={onGoBack}
            className="text-[#979797] hover:text-white transition-colors flex-shrink-0"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-8 space-y-4">
          <p className="text-[#d0d0d0] text-base leading-relaxed">
            This content is marked as <strong>NSFW</strong> (Not Safe For Work)
            and contains adult material.
          </p>
          <p className="text-[#b0b0b0] text-sm leading-relaxed">
            By proceeding, you confirm that you are{" "}
            <strong>18 years of age or older</strong> and wish to view this
            content.
          </p>
        </div>

        {/* Question */}
        <div className="bg-[#252525] border border-[#333333] rounded-md p-4 mb-8">
          <p className="text-white font-semibold">
            Are you 18 years of age or older?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onGoBack}
            className="flex-1 px-4 py-3 bg-[#2a2a2a] hover:bg-[#333333] text-white font-semibold rounded-lg transition-all active:scale-95 text-sm"
          >
            No, Go Back
          </button>
          <button
            onClick={onProceed}
            className="flex-1 px-4 py-3 bg-[#0088CC] hover:bg-[#0077BB] text-white font-semibold rounded-lg transition-all active:scale-95 text-sm"
          >
            Yes, I'm 18+
          </button>
        </div>
      </div>
    </div>
  );
}
