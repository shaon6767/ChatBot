import { useState } from "react";

export default function SetupPanel({ config, onChange }) {
  const [open, setOpen] = useState(false);

  const update = (field, value) => onChange({ ...config, [field]: value });

  return (
    <div className="bg-gray-50 border-b border-gray-100">

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-8 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-none cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">⚙️</span>
          <span className="text-sm font-semibold text-gray-700">Business Settings</span>
          <span className="text-xs bg-violet-100 text-violet-700 rounded-full px-3 py-1 font-medium border border-violet-200">
            {open ? "tap to close" : "tap to edit"}
          </span>
        </div>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {/* Fields */}
      {open && (
        <div className="px-8 pb-6 flex flex-col gap-4 border-t border-gray-100">

          {/* Name + Language */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Business name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Dhaka Fashion"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Language
              </label>
              <input
                type="text"
                value={config.lang}
                onChange={(e) => update("lang", e.target.value)}
                placeholder="Bangla / English"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 bg-white"
              />
            </div>
          </div>

          {/* Rules */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Products, prices & rules
            </label>
            <textarea
              value={config.rules}
              onChange={(e) => update("rules", e.target.value)}
              rows={4}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-violet-400 bg-white resize-none"
            />
            <p className="text-xs text-gray-400">
              Include prices, minimum prices, delivery info, and payment method.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}