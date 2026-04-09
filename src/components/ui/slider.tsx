import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  armColor?: 'left' | 'right';
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, armColor, ...props }, ref) => {
  const rangeClass = armColor === 'left'
    ? 'bg-arm-left shadow-[0_0_8px_hsl(var(--arm-left)/0.5)]'
    : armColor === 'right'
      ? 'bg-arm-right shadow-[0_0_8px_hsl(var(--arm-right)/0.5)]'
      : 'bg-primary';

  const thumbClass = armColor === 'left'
    ? 'border-arm-left shadow-[0_0_10px_hsl(var(--arm-left)/0.4)]'
    : armColor === 'right'
      ? 'border-arm-right shadow-[0_0_10px_hsl(var(--arm-right)/0.4)]'
      : 'border-primary';

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className={cn("absolute h-full transition-shadow", rangeClass)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn(
        "block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110",
        thumbClass
      )} />
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
