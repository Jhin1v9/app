import { motion } from 'framer-motion'

interface FilterTabsProps<T extends string> {
  tabs: { value: T; label: string }[]
  active: T
  onChange: (value: T) => void
  variant?: 'pills' | 'underline'
}

export default function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
  variant = 'pills',
}: FilterTabsProps<T>) {
  if (variant === 'pills') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <motion.button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              active === tab.value
                ? 'text-[#0A0E1A]'
                : 'text-[#8B95B8] hover:text-[#F0F0F5]'
            }`}
            style={
              active === tab.value
                ? {
                    background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
                  }
                : {
                    background: '#141B2D',
                    border: '1px solid #2A3655',
                  }
            }
            whileHover={active !== tab.value ? { scale: 1.02 } : {}}
            whileTap={active !== tab.value ? { scale: 0.98 } : {}}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            active === tab.value
              ? 'text-[#D4A830]'
              : 'text-[#8B95B8] hover:text-[#F0F0F5]'
          }`}
        >
          {tab.label}
          {active === tab.value && (
            <motion.div
              layoutId="filter-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)' }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
