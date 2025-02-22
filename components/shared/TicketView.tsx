"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IOrder } from "@/lib/database/models/order.model";
import { formatDateTime } from "@/lib/utils";
import {
  Document,
  Image,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { PrinterIcon } from "lucide-react";
import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface ITicketDetails extends IOrder {
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

type TicketViewProps = {
  ticketDetails: ITicketDetails;
};

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    height: "100%",
  },
  banner: {
    width: "100%",
    height: "25%",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    height: "40%",
  },
  eventTitleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20 40",
  },
  eventTitle: {
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  content: {
    padding: "20 40 0 40",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1pt solid #CCCCCC",
  },
  lastSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderLeft: "3pt solid #666666",
    paddingLeft: 8,
    fontWeight: "bold",
  },
  label: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  value: {
    fontSize: 12,
    color: "#1a1a1a",
    marginBottom: 4,
    letterSpacing: 0.3,
    lineHeight: 1.4,
  },
  highlight: {
    fontSize: 13,
    color: "#1a1a1a",
    marginBottom: 4,
    letterSpacing: 0.3,
    fontWeight: "bold",
    lineHeight: 1.4,
  },
  bottomSection: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  qrSection: {
    backgroundColor: "#f8f8f8",
    padding: "15 40",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1pt solid #CCCCCC",
  },
  qrCode: {
    width: 100,
    height: 100,
    marginRight: 30,
  },
  qrInfo: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 14,
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  verificationCode: {
    fontSize: 11,
    color: "#666666",
    marginTop: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  footer: {
    padding: "12 40",
    textAlign: "center",
    color: "#666666",
    fontSize: 9,
    letterSpacing: 0.3,
    background: "#f8f8f8",
    borderTop: "1pt solid #CCCCCC",
    lineHeight: 1.4,
  },
});

// PDF Document Component
const TicketPDF = ({
  ticketDetails,
  qrCodeUrl,
}: {
  ticketDetails: ITicketDetails;
  qrCodeUrl: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.banner}>
        <Image
          src={ticketDetails.event.imageUrl || "default-event-image.jpg"}
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay} />
        <View style={styles.eventTitleContainer}>
          <Text style={styles.eventTitle}>{ticketDetails.event.title}</Text>
          <Text style={styles.eventSubtitle}>Official Event Ticket</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Details</Text>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.highlight}>
                {formatDateTime(ticketDetails.event.startDateTime).dateTime}
              </Text>
              <Text style={styles.value}>
                to {formatDateTime(ticketDetails.event.endDateTime).dateTime}
              </Text>

              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{ticketDetails.event.location}</Text>

              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>
                {ticketDetails.event.category.name}
              </Text>

              <Text style={styles.label}>Ticket Price</Text>
              <Text style={styles.value}>
                {ticketDetails.event.isFree
                  ? "Free Entry"
                  : `$${ticketDetails.event.price}`}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendee Information</Text>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.highlight}>
                {ticketDetails.buyer.firstName} {ticketDetails.buyer.lastName}
              </Text>

              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>{ticketDetails.buyer.email}</Text>
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <Text style={styles.label}>Order Reference</Text>
              <Text style={styles.value}>{ticketDetails._id}</Text>

              <Text style={styles.label}>Purchase Date</Text>
              <Text style={styles.value}>
                {formatDateTime(ticketDetails.createdAt).dateTime}
              </Text>

              <Text style={styles.label}>Amount Paid</Text>
              <Text style={styles.highlight}>${ticketDetails.totalAmount}</Text>
            </View>

            <View style={styles.lastSection}>
              <Text style={styles.sectionTitle}>Event Organizer</Text>
              <Text style={styles.label}>Contact Person</Text>
              <Text style={styles.highlight}>
                {ticketDetails.event.organizer.firstName}{" "}
                {ticketDetails.event.organizer.lastName}
              </Text>

              <Text style={styles.label}>Contact Email</Text>
              <Text style={styles.value}>
                {ticketDetails.event.organizer.email}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.qrSection}>
          <Image src={qrCodeUrl} style={styles.qrCode} />
          <View style={styles.qrInfo}>
            <Text style={styles.qrTitle}>Digital Entry Pass</Text>
            <Text style={styles.value}>
              Please present this QR code at the event entrance for quick
              check-in
            </Text>
            <Text style={styles.verificationCode}>
              Verification Code: {ticketDetails._id.slice(-6).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            This is an official event ticket. Valid for one-time entry only.
            This ticket can be presented digitally or in printed form.
          </Text>
          <Text>
            Generated on {new Date().toLocaleDateString()} • Powered by Evently
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

const TicketView = ({ ticketDetails }: TicketViewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Create comprehensive ticket data for QR code
  const ticketData = JSON.stringify({
    ticket: {
      id: ticketDetails._id,
      purchaseDate: formatDateTime(ticketDetails.createdAt).dateTime,
      totalAmount: ticketDetails.totalAmount,
      stripeId: ticketDetails.stripeId,
    },
    event: {
      id: ticketDetails.event._id,
      title: ticketDetails.event.title,
      description: ticketDetails.event.description,
      price: ticketDetails.event.price,
      isFree: ticketDetails.event.isFree,
      startDate: formatDateTime(ticketDetails.event.startDateTime).dateTime,
      endDate: formatDateTime(ticketDetails.event.endDateTime).dateTime,
      location: ticketDetails.event.location,
      imageUrl: ticketDetails.event.imageUrl,
      url: ticketDetails.event.url,
      category: ticketDetails.event.category,
      organizer: {
        id: ticketDetails.event.organizer._id,
        name: `${ticketDetails.event.organizer.firstName} ${ticketDetails.event.organizer.lastName}`,
        email: ticketDetails.event.organizer.email,
      },
    },
    attendee: {
      id: ticketDetails.buyer._id,
      name: `${ticketDetails.buyer.firstName} ${ticketDetails.buyer.lastName}`,
      email: ticketDetails.buyer.email,
      username: ticketDetails.buyer.username,
    },
    validationHash: `${ticketDetails._id}-${ticketDetails.buyer._id}-${ticketDetails.event._id}`,
  });

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(ticketData, {
          width: 150,
          margin: 2,
          errorCorrectionLevel: "H",
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };

    generateQRCode();
  }, [ticketData]);

  if (!qrCodeUrl) {
    return null; // or a loading state
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="button sm:w-fit">View Ticket</Button>
      </DialogTrigger>
      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center pb-4 border-b">
            Event Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-8 p-4">
          {/* Left side - Event & Attendee Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="font-semibold text-xl text-primary-500">
                {ticketDetails.event.title}
              </h3>
              <p className="text-gray-500">
                {formatDateTime(ticketDetails.event.startDateTime).dateTime}
              </p>
              <p className="text-gray-500">
                Location: {ticketDetails.event.location}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Attendee Details</h4>
              <p className="text-gray-600">
                {ticketDetails.buyer.firstName} {ticketDetails.buyer.lastName}
              </p>
              <p className="text-gray-600">{ticketDetails.buyer.email}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Order Information</h4>
              <p className="text-gray-600">Order ID: {ticketDetails._id}</p>
              <p className="text-gray-600">
                Purchase Date:{" "}
                {formatDateTime(ticketDetails.createdAt).dateTime}
              </p>
              <p className="text-gray-600">
                Amount Paid: ${ticketDetails.totalAmount}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Organizer</h4>
              <p className="text-gray-600">
                {ticketDetails.event.organizer.firstName}{" "}
                {ticketDetails.event.organizer.lastName}
              </p>
            </div>

            <PDFDownloadLink
              document={
                <TicketPDF
                  ticketDetails={ticketDetails}
                  qrCodeUrl={qrCodeUrl}
                />
              }
              fileName={`${ticketDetails.event.title
                .toLowerCase()
                .replace(/\s+/g, "-")}-ticket.pdf`}
            >
              {({ loading }) => (
                <Button
                  className="flex items-center gap-2 mt-4"
                  disabled={loading}
                >
                  <PrinterIcon className="w-4 h-4" />
                  {loading ? "Generating PDF..." : "Download Ticket"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>

          {/* Right side - QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <QRCodeSVG
                value={ticketData}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Scan this QR code at the event for entry
            </p>
            <p className="text-xs text-gray-400 text-center">
              Ticket verification code:{" "}
              {ticketDetails._id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketView;
