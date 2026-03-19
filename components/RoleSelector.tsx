import { rolePills } from '@/lib/constants';
import type { Role } from '@/lib/types';

interface Props {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export default function RoleSelector({ currentRole, onRoleChange }: Props) {
  return (
    <>
      <div className="sec-label">Your target role</div>
      <div className="role-row">
        {rolePills.map(({ key, label }) => (
          <button
            key={key}
            className={`role-pill${currentRole === key ? ' active' : ''}`}
            onClick={() => onRoleChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
