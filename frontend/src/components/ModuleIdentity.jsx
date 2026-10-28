import { useContext } from "react";
import { ModuleContext } from "./moduleContext";
export default function ModuleIdentity() {
  const item = useContext(ModuleContext);
  if (!item) return null;
  const Icon = item.icon;
  return <span className={`module-identity identity-${item.group}`} aria-hidden="true"><span /><Icon /><i /><i /></span>;
}
