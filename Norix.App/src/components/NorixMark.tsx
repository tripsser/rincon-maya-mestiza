type NorixMarkProps = {
  compact?: boolean
}

export function NorixMark({ compact = false }: NorixMarkProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="norix-mark" aria-hidden="true">
        <span />
        <span />
      </div>
      {!compact && (
        <div>
          <div className="text-[2rem] font-semibold leading-none tracking-[0.28em] text-white">
            NORIX
          </div>
          <div className="mt-1 text-sm font-semibold tracking-[0.72em] text-norix-blue">
            SAAS
          </div>
        </div>
      )}
    </div>
  )
}
