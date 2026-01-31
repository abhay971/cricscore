/**
 * Declare One Toggle Component
 * Checkbox/toggle for enabling "Declare 1 Run" custom rule
 * When active, strike doesn't change until over ends
 */
const DeclareOneToggle = ({ checked, onChange, disabled = false }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[#353647] rounded-[20px] border border-[#4A4B5E]">
      <div className="flex-1">
        <label htmlFor="declare-one" className="flex items-start gap-2 cursor-pointer">
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">
              Declare 1 Run
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Strike won't change until over ends
            </p>
          </div>
        </label>
      </div>

      {/* Toggle Switch */}
      <div className="relative">
        <input
          type="checkbox"
          id="declare-one"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <label
          htmlFor="declare-one"
          className={`
            block w-12 h-7 rounded-full transition-colors cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${checked ? 'bg-[#8BC9E8]' : 'bg-[#4A4B5E]'}
          `}
        >
          <div
            className={`
              absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          ></div>
        </label>
      </div>
    </div>
  );
};

export default DeclareOneToggle;
