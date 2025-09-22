"use client"

import { Button } from "@/components/ui/button"
import { toggleStarMarked } from "@/features/playground/actions"
import { useStarred } from "@/features/dashboard/context/starred-context"
import { StarIcon, StarOffIcon } from "lucide-react"
import type React from "react"
import { useState, useEffect, forwardRef } from "react"
import { toast } from "sonner"

interface MarkedToggleButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  markedForRevision: boolean
  id: string
}

export const MarkedToggleButton = forwardRef<HTMLButtonElement, MarkedToggleButtonProps>(
  ({ markedForRevision, id, onClick, className, children, ...props }, ref) => {
    const [isMarked, setIsMarked] = useState(markedForRevision)
    
    // Try to use the context, but handle cases where it might not be available
    let updatePlaygroundStar: ((playgroundId: string, starred: boolean) => void) | null = null
    try {
      const starredContext = useStarred()
      updatePlaygroundStar = starredContext.updatePlaygroundStar
    } catch (error) {
      // Context not available, this is fine - component will still work without real-time updates
    }

    useEffect(() => {
      setIsMarked(markedForRevision)
    }, [markedForRevision])

    const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
      // Call the original onClick if provided by the parent (DropdownMenuItem)
      onClick?.(event)

      const newMarkedState = !isMarked
      setIsMarked(newMarkedState)
      
      // Optimistically update the context immediately if available
      if (updatePlaygroundStar) {
        updatePlaygroundStar(id, newMarkedState)
      }

      try {
        const res = await toggleStarMarked(id, newMarkedState)
        const {success ,error , isMarked} = res;

    //    if ismarked true then show marked successfully otherwise show start over
        if (isMarked && !error && success) {
          toast.success("Added to Favorites successfully")
        } else {
          toast.success("Removed from Favorites successfully")
        }

      } catch (error) {
        console.error("Failed to toggle mark for revision:", error)
        setIsMarked(!newMarkedState) // Revert state if the update fails
        // Revert context state if database update fails and context is available
        if (updatePlaygroundStar) {
          updatePlaygroundStar(id, !newMarkedState)
        }
        toast.error("Failed to update favorite status")
      }
    }

    return (
      <Button
        ref={ref}
        variant="ghost"
        className={`flex items-center justify-start w-full px-2 py-1.5 text-sm rounded-md cursor-pointer ${className}`}
        onClick={handleToggle}
        {...props}
      >
        {isMarked ? (
          <StarIcon size={16} className="text-red-500 mr-2" />
        ) : (
          <StarOffIcon size={16} className="text-gray-500 mr-2" />
        )}
        {children || (isMarked ? "Remove Favorite" : "Add to Favorite")}
      </Button>
    )
  },
)

MarkedToggleButton.displayName = "MarkedToggleButton"
