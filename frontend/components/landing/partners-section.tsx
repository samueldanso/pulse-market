export function PartnersSection() {
	return (
		<section className="mx-auto max-w-[1000px] px-6 pb-24 text-center">
			<p className="mb-12 text-[10px] uppercase tracking-[0.2em] text-gray-400">Powered By</p>
			<div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10 opacity-70 transition-opacity duration-500 hover:opacity-100">
				<span className="flex items-center gap-2.5 text-xl font-bold">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#E84142" />
						<path
							d="M2 17L12 22L22 17"
							stroke="#E84142"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M2 12L12 17L22 12"
							stroke="#E84142"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					Avalanche
				</span>
				<span className="flex items-center gap-2 text-xl font-bold">
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="10" cy="10" r="8" fill="currentColor" />
						<path d="M6 10h8M10 6v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
					</svg>
					Privy
				</span>
				<span className="flex flex-col items-start gap-0.5 text-sm font-bold leading-none">
					<span>CHAIN</span>
					<span>LINK</span>
				</span>
			</div>
		</section>
	)
}
