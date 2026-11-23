import { useEffect, useState } from "react";
import { X, Info, Globe, Grid3x3, ChevronDown } from "lucide-react";
import { useBranchStore } from "../../store/branchStore";
import AddressTab from "./AddressTab";
import TextInput from "../../components/shared/TextInput";
import ToggleBtn from "../../components/shared/ToggleBtn";
import MiniModal, { ModalTab } from "../../components/shared/MiniModal";

// ─── Types ──────────────────────────────────────────────────────────────────

interface BranchSettingsModalProps {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TABS: ModalTab[] = [
  { key: "General", label: "General" },
  { key: "Address", label: "Address" },
  { key: "Integrations", label: "Integrations" },
  { key: "Schedule Store Busy", label: "Schedule Store Busy" },
  { key: "Invoice Settings", label: "Invoice Settings" },
];

// ─── Other form primitives (unchanged in behavior) ─────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
      <label className="text-[13px] text-slate-300">{label}</label>
      <div>{children}</div>
    </div>
  );
}

function CountrySelect({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-md border border-white/10 bg-[#12151b] px-3 py-2 text-[13px] text-slate-200 hover:border-white/20"
    >
      {value}
      <ChevronDown size={14} className="text-slate-500" />
    </button>
  );
}

function RoleChips({
  roles,
  onRemove,
}: {
  roles: string[];
  onRemove: (role: string) => void;
}) {
  return (
    <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border border-white/10 bg-[#12151b] p-2">
      {roles.map((role) => (
        <span
          key={role}
          className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-[12px] text-slate-200"
        >
          {role}
          <button
            type="button"
            onClick={() => onRemove(role)}
            className="text-slate-500 hover:text-slate-300"
            aria-label={`Remove ${role}`}
          >
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  usage,
  on,
  onChange,
  disabled,
  warning,
}: {
  icon: React.ElementType;
  title: string;
  usage: string;
  on: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  warning?: React.ReactNode;
}) {
  return (
    <div
      className={`flex-1 rounded-lg border p-4 ${warning ? "border-amber-500/40" : "border-white/10"}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-200">
          <Icon size={15} className="text-sky-400" />
          {title}
        </div>
        <ToggleBtn on={on} onChange={onChange} label="" />
      </div>
      <p className="text-[12px] text-slate-500">{usage}</p>
      {warning && <div className="mt-1 text-[12px]">{warning}</div>}
    </div>
  );
}

// ─── General tab ────────────────────────────────────────────────────────────

function GeneralTab() {
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [posEnabled, setPosEnabled] = useState(false);
  const [roles, setRoles] = useState([
    "Default",
    "Lekki",
    "Marketing Department",
    "Operations Manager",
    "Audit",
  ]);
  const [hideBranch, setHideBranch] = useState(false);
  const [wheelchair, setWheelchair] = useState(false);
  const [disableCash, setDisableCash] = useState(false);
  const [disableAutoReceiving, setDisableAutoReceiving] = useState(false);
  const [hidePhone, setHidePhone] = useState(false);
  const [carDetails, setCarDetails] = useState(true);
  const [requireMake, setRequireMake] = useState(false);
  const [requireColor, setRequireColor] = useState(false);
  const [requirePlate, setRequirePlate] = useState(false);
  const { selectedBranch } = useBranchStore();
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-slate-200">
          <Info size={14} className="text-sky-400" />
          Enabled services
        </div>
        <div className="flex gap-3">
          <ServiceCard
            icon={Globe}
            title="Enable online branch"
            usage="16 out of 16"
            on={onlineEnabled}
            onChange={setOnlineEnabled}
          />
          <ServiceCard
            icon={Grid3x3}
            title="Enable POS branch"
            usage="0 out of 0"
            on={posEnabled}
            onChange={setPosEnabled}
            disabled
            warning={
              <span className="text-amber-400">
                POS branch limit reached.{" "}
                <button type="button" className="text-sky-400 hover:underline">
                  Add-Ons
                </button>
              </span>
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <Field label="English name">
          <TextInput value={selectedBranch?.name} />
        </Field>
        <Field label="Arabic name">
          <TextInput value={selectedBranch?.name} />
        </Field>
        <Field label="Phone">
          <div className="space-y-2">
            <CountrySelect value="Nigeria +234" />
            <TextInput value={selectedBranch?.phone!} />
          </div>
        </Field>
        <Field label="Whatsapp Number">
          <div className="space-y-2">
            <CountrySelect value="Nigeria +234" />
            <TextInput value={selectedBranch?.phone!} />
          </div>
        </Field>
        <Field label="Roles">
          <RoleChips
            roles={roles}
            onRemove={(role) => setRoles((r) => r.filter((x) => x !== role))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-x-8 py-1.5 gap-y-1 border-t border-white/5 pt-4">
        <ToggleBtn
          label="Hide branch from store and invoice"
          on={hideBranch}
          onChange={setHideBranch}
        />
        <ToggleBtn
          label="Show wheelchair accessibility"
          on={wheelchair}
          onChange={setWheelchair}
        />
        <ToggleBtn
          label="Disable cash"
          on={disableCash}
          onChange={setDisableCash}
        />
        <ToggleBtn
          label="Disable auto receiving"
          on={disableAutoReceiving}
          onChange={setDisableAutoReceiving}
        />
        <ToggleBtn
          label="Hide branch phone number"
          on={hidePhone}
          onChange={setHidePhone}
        />
        <div className="col-span-2">
          <ToggleBtn
            label="Ask for car details (pickup)"
            on={carDetails}
            onChange={setCarDetails}
          >
            <ToggleBtn
              label="Enable make as a required field"
              on={requireMake}
              onChange={setRequireMake}
            />
            <ToggleBtn
              label="Enable color as a required field"
              on={requireColor}
              onChange={setRequireColor}
            />
            <ToggleBtn
              label="Enable plate number as a required field"
              on={requirePlate}
              onChange={setRequirePlate}
            />
          </ToggleBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Modal shell ────────────────────────────────────────────────────────────
// Grid rows instead of flex+max-h: header, tabs, and footer get fixed
// `auto` rows; the body gets `1fr` and is the only scrollable region.
// That's what keeps the tab bar from ever being squeezed or overlapped.

interface BranchSettingsModalProps {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function BranchSettingsModal({
  id,
  open,
  setOpen,
}: BranchSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("General");
  const { branches } = useBranchStore();
  const setSelected = useBranchStore((s) => s.setSelectedBranch);

  useEffect(() => {
    const match = branches?.find((b) => {
      (b.id === id, b.name);
    });
    if (match) setSelected(match);
  }, [branches, id, setSelected]);

  return (
    <MiniModal
      open={open}
      onClose={() => setOpen(false)}
      title="Settings"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSave={() => console.log("save")}
      maxWidth="max-w-[640px]" // ← widen here e.g. max-w-[900px]
    >
      {activeTab === "General" && <GeneralTab />}
      {activeTab === "Address" && <AddressTab />}
      {!["General", "Address"].includes(activeTab) && (
        <div className="flex flex-1 items-center justify-center py-16 text-center text-[13px] text-slate-500">
          {activeTab} settings will appear here once specified.
        </div>
      )}
    </MiniModal>
  );
}
