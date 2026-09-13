import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      expand={true}
      duration={3500}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans text-sm rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all",
          title: "font-semibold text-sm",
          description: "text-xs text-muted-foreground mt-0.5",
          actionButton: "bg-primary text-primary-foreground text-xs px-3 py-1 rounded-md font-medium",
          cancelButton: "bg-muted text-muted-foreground text-xs px-3 py-1 rounded-md",
          closeButton: "border border-white/10 hover:bg-white/10 transition-colors",
          success:
            "!bg-[#0c1f17]/95 !text-emerald-300 !border-emerald-500/50 !shadow-[0_0_30px_rgba(16,185,129,0.25)]",
          error:
            "!bg-[#260f14]/95 !text-rose-300 !border-rose-500/50 !shadow-[0_0_30px_rgba(244,63,94,0.25)]",
          warning:
            "!bg-[#261e0f]/95 !text-amber-300 !border-amber-500/50 !shadow-[0_0_20px_rgba(245,158,11,0.2)]",
          info:
            "!bg-[#0f1b26]/95 !text-cyan-300 !border-cyan-500/50 !shadow-[0_0_20px_rgba(6,182,212,0.2)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
