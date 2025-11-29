import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

type SliderRef = React.ElementRef<typeof SliderPrimitive.Root>
type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>

const Slider = React.forwardRef(({ className, ...props }: SliderProps, ref: React.Ref<SliderRef>) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-sm hover:shadow-md hover:bg-primary/10 hover:border-primary/80 active:scale-95 transition-transform transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderPrimitive.Root>
)) as React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<SliderRef>>
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
