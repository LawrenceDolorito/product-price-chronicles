
import { Shield, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserRoleTagProps {
  role: string;
  className?: string;
}

const UserRoleTag = ({ role, className }: UserRoleTagProps) => {
  const getRoleConfig = () => {
    switch (role) {
      case "admin":
        return {
          icon: <ShieldCheck className="h-3 w-3 mr-1" />,
          variant: "default" as const,
          label: "Admin"
        };
      case "user":
        return {
          icon: <User className="h-3 w-3 mr-1" />,
          variant: "secondary" as const,
          label: "User"
        };
      case "blocked":
        return {
          icon: <ShieldAlert className="h-3 w-3 mr-1" />,
          variant: "destructive" as const,
          label: "Blocked"
        };
      default:
        return {
          icon: <Shield className="h-3 w-3 mr-1" />,
          variant: "outline" as const,
          label: role
        };
    }
  };

  const { icon, variant, label } = getRoleConfig();

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {label}
    </Badge>
  );
};

export default UserRoleTag;
