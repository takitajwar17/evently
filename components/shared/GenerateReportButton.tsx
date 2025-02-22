"use client";

import { IOrderItem } from "@/lib/database/models/order.model";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import PDFDownloadLink with no SSR
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <button className="p-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md">
        Loading...
      </button>
    ),
  }
);

type GenerateReportButtonProps = {
  orders: IOrderItem[];
  event: any;
};

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  headerSection: {
    marginBottom: 30,
  },
  reportTitle: {
    fontSize: 28,
    marginBottom: 10,
    color: "#1D4ED8", // primary blue color
    textAlign: "center",
    fontWeight: "bold",
  },
  eventInfoContainer: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 5,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 15,
    color: "#1D4ED8",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: "#6B7280",
    width: "30%",
  },
  value: {
    fontSize: 11,
    color: "#111827",
    width: "70%",
    fontWeight: "bold",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableHeader: {
    margin: "auto",
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    fontSize: 10,
    padding: 8,
  },
  headerCell: {
    fontSize: 10,
    padding: 8,
    fontWeight: "bold",
    color: "#374151",
  },
  summarySection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
});

// PDF Document component
const PDFReport = ({ orders, event }: GenerateReportButtonProps) => {
  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.totalAmount),
    0
  );
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.reportTitle}>Event Sales Report</Text>
          <Text style={{ fontSize: 12, textAlign: "center", color: "#6B7280" }}>
            Generated on {currentDate}
          </Text>
        </View>

        <View style={styles.eventInfoContainer}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Event Name:</Text>
            <Text style={styles.value}>{event.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {formatDateTime(event.startDateTime).dateTime}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{event.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Organizer:</Text>
            <Text style={styles.value}>
              {event.organizer.firstName} {event.organizer.lastName}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Sales Summary</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableCol}>
              <Text style={styles.headerCell}>Order ID</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.headerCell}>Buyer Name</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.headerCell}>Purchase Date</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.headerCell}>Amount</Text>
            </View>
          </View>

          {orders.map((order) => (
            <View style={styles.tableRow} key={order._id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{order._id}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{order.buyer}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {formatDateTime(order.createdAt).dateTime}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {formatPrice(order.totalAmount)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Tickets Sold:</Text>
            <Text style={styles.summaryValue}>{orders.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Revenue:</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(totalRevenue.toString())}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Ticket Price:</Text>
            <Text style={styles.summaryValue}>
              {formatPrice((totalRevenue / orders.length).toFixed(2))}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This report was generated automatically by Evently. For any questions,
          please contact support.
        </Text>
      </Page>
    </Document>
  );
};

const GenerateReportButton = ({ orders, event }: GenerateReportButtonProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button className="p-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md">
        Loading...
      </button>
    );
  }

  return (
    <div className="flex justify-end">
      <PDFDownloadLink
        document={<PDFReport orders={orders} event={event} />}
        fileName={`${event.title}-report.pdf`}
        className="p-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md"
      >
        {({ blob, url, loading, error }) =>
          loading ? "Generating report..." : "Download PDF Report"
        }
      </PDFDownloadLink>
    </div>
  );
};

export default GenerateReportButton;
