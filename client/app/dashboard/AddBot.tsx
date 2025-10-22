"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Snippet } from "@/components/ui/snippet-1";
import { CreditCard, Wallet } from "lucide-react";

import { useId } from "react";

function AddBot() {
  const id = useId();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          Add Agent To Server
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
            aria-hidden="true"
          >
            <Wallet className="opacity-80" size={16} strokeWidth={2} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">Add Agent</DialogTitle>
            <DialogDescription className="text-left">
              You can copy the below link and open in a browser and follow steps
              there
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Snippet text="https://pranjalrana.com" />
            </div>
          </div>
          <Button type="button" className="w-full cursor-pointer">
            Done
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddBot;
