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
  },
  banner: {
    width: "100%",
    height: "35%",
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
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  eventTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  section: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: "0.5pt solid #CCCCCC",
  },
  lastSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 8,
    color: "#666666",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
    color: "#333333",
  },
  qrSection: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  qrCode: {
    width: 100,
    height: 100,
  },
  qrInfo: {
    flex: 1,
    marginLeft: 20,
  },
  verificationCode: {
    fontSize: 9,
    color: "#666666",
    marginTop: 5,
  },
  footer: {
    padding: "10 20",
    textAlign: "center",
    color: "#666666",
    fontSize: 8,
    borderTop: "0.5pt solid #CCCCCC",
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
        <View style={styles.bannerOverlay}>
          <Text style={styles.eventTitle}>{ticketDetails.event.title}</Text>
          <Text style={styles.eventSubtitle}>Event Ticket</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Details</Text>
              <Text style={styles.text}>
                Start:{" "}
                {formatDateTime(ticketDetails.event.startDateTime).dateTime}
              </Text>
              <Text style={styles.text}>
                End: {formatDateTime(ticketDetails.event.endDateTime).dateTime}
              </Text>
              <Text style={styles.text}>
                Location: {ticketDetails.event.location}
              </Text>
              <Text style={styles.text}>
                Category: {ticketDetails.event.category.name}
              </Text>
              <Text style={styles.text}>
                Price:{" "}
                {ticketDetails.event.isFree
                  ? "Free"
                  : `$${ticketDetails.event.price}`}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendee Information</Text>
              <Text style={styles.text}>
                Name: {ticketDetails.buyer.firstName}{" "}
                {ticketDetails.buyer.lastName}
              </Text>
              <Text style={styles.text}>
                Email: {ticketDetails.buyer.email}
              </Text>
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <Text style={styles.text}>Order ID: {ticketDetails._id}</Text>
              <Text style={styles.text}>
                Purchase Date:{" "}
                {formatDateTime(ticketDetails.createdAt).dateTime}
              </Text>
              <Text style={styles.text}>
                Amount Paid: ${ticketDetails.totalAmount}
              </Text>
            </View>

            <View style={styles.lastSection}>
              <Text style={styles.sectionTitle}>Organizer Information</Text>
              <Text style={styles.text}>
                {ticketDetails.event.organizer.firstName}{" "}
                {ticketDetails.event.organizer.lastName}
              </Text>
              <Text style={styles.text}>
                {ticketDetails.event.organizer.email}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.qrSection}>
          <Image src={qrCodeUrl} style={styles.qrCode} />
          <View style={styles.qrInfo}>
            <Text style={styles.text}>
              Scan this QR code at the event entrance
            </Text>
            <Text style={styles.verificationCode}>
              Verification Code: {ticketDetails._id.slice(-6).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>
          This ticket is valid for one-time entry. Please present this ticket
          (digital or printed) at the event entrance.
        </Text>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
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
