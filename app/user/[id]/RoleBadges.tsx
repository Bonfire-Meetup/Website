interface RoleBadgesProps {
  roles: string[];
}

const roleConfig = {
  crew: {
    label: "Crew",
    gradient: "from-blue-500 via-indigo-500 to-purple-600",
    borderGradient: "from-blue-400 to-purple-500",
    glow: "blue-500/40",
    bgPattern: "bg-blue-500/10",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  speaker: {
    label: "Speaker",
    gradient: "from-orange-500 via-rose-500 to-pink-600",
    borderGradient: "from-orange-400 to-pink-500",
    glow: "orange-500/40",
    bgPattern: "bg-orange-500/10",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export function RoleBadges({ roles }: RoleBadgesProps) {
  const displayRoles = roles.filter((role) => role in roleConfig);

  if (displayRoles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {displayRoles.map((role) => {
        const config = roleConfig[role as keyof typeof roleConfig];
        return (
          <div key={role} className="group relative">
            <div
              className={`absolute -inset-0.5 rounded-full bg-gradient-to-r ${config.borderGradient} opacity-75 blur transition duration-300 group-hover:opacity-100`}
            />
            <div
              className={`relative flex items-center gap-2 rounded-full bg-gradient-to-r ${config.gradient} px-4 py-2 shadow-xl`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${config.bgPattern} backdrop-blur-sm`}
              >
                {config.icon}
              </div>
              <span className="text-sm font-bold tracking-wide text-white uppercase">
                {config.label}
              </span>
              <div className="h-1 w-1 animate-pulse rounded-full bg-white/60" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
