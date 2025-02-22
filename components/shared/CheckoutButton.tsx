"use client";

import {
  getTicketDetails,
  hasUserPurchasedTicket,
} from "@/lib/actions/order.actions";
import { IEvent } from "@/lib/database/models/event.model";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Document } from "mongoose";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Checkout from "./Checkout";
import TicketView from "./TicketView";

interface ITicketDetails extends Document {
  _id: string;
  createdAt: Date;
  stripeId: string;
  totalAmount: string;
  event: {
    _id: string;
    title: string;
    description: string;
    price: string;
    isFree: boolean;
    startDateTime: Date;
    endDateTime: Date;
    location: string;
    imageUrl: string;
    url: string;
    category: {
      _id: string;
      name: string;
    };
    organizer: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
}

const CheckoutButton = ({ event }: { event: IEvent }) => {
  const { user } = useUser();
  const userId = user?.publicMetadata.userId as string;
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<ITicketDetails | null>(
    null
  );
  const hasEventFinished = new Date(event.endDateTime) < new Date();

  useEffect(() => {
    const checkTicketPurchase = async () => {
      if (userId) {
        const hasPurchased = await hasUserPurchasedTicket(event._id, userId);
        setHasTicket(!!hasPurchased);

        if (hasPurchased) {
          const details = await getTicketDetails(event._id, userId);
          setTicketDetails(details as ITicketDetails);
        }
      }
    };

    checkTicketPurchase();
  }, [event._id, userId]);

  return (
    <div className="flex items-center gap-3">
      {hasEventFinished ? (
        <p className="p-2 text-red-400">
          Sorry, tickets are no longer available.
        </p>
      ) : (
        <>
          <SignedOut>
            <Button asChild className="button rounded-full" size="lg">
              <Link href="/sign-in">Get Tickets</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            {hasTicket ? (
              ticketDetails && <TicketView ticketDetails={ticketDetails} />
            ) : (
              <Checkout event={event} userId={userId} />
            )}
          </SignedIn>
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
