export default function PasswordTips({ password }: { password: string }) {
  // 计算密码强度
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[!@#$%^&*()-=_+]/.test(password)) strength += 25;
    return Math.min(100, strength);
  };

  const passwordStrength = calculatePasswordStrength(password);

  return (
    <div className="absolute left-0 bottom-14 mt-2 bg-gray-100 rounded-lg p-4 shadow-lg z-10 w-full">
      <div className="mb-2">
        <div className="text-sm font-medium mb-1">密码强度: {passwordStrength}%</div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              passwordStrength >= 75
                ? 'bg-green-500'
                : passwordStrength >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${passwordStrength}%` }}
          />
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <div>密码要求：</div>
        <div className={` ${password.length >= 8 ? 'text-green-500' : 'text-gray-500'}`}>
          • 至少8个字符
        </div>
        <div className={` ${/\d/.test(password) ? 'text-green-500' : 'text-gray-500'}`}>
          • 至少1个数字
        </div>
        <div className={` ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-500'}`}>
          • 至少1个大写字母
        </div>
        <div className={` ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-500'}`}>
          • 至少1个小写字母
        </div>
        <div className={` ${/[@$!%*?&]/.test(password) ? 'text-green-500' : 'text-gray-500'}`}>
          • 只能包含以下特殊字符之一：!@#$%^&*()-=_+
        </div>
      </div>
    </div>
  );
}
