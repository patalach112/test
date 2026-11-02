import { GitBranch } from "lucide-react";
import Link from "next/link";
export function Brand() {
  return (
    <Link className="fw-brand" href="/" aria-label="FirmwareWatch home">
      <GitBranch size={30} />
      <span>FirmwareWatch</span>
    </Link>
  );
}
