"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";

interface Consultation {
  id: string;
  created_at: string;
  doctor_name: string;
  diagnosis: string | null;
  prescription: string | null;
  notes: string;
}

interface PatientInfo {
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
}

interface ConsultationPDFProps {
  patient: PatientInfo;
  consultations: Consultation[];
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    padding: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontSize: 10,
    color: "#666666",
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  consultation: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  consultationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  consultationDate: {
    fontSize: 12,
    fontWeight: "bold",
  },
  consultationDoctor: {
    fontSize: 10,
    color: "#666666",
  },
  fieldLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: 10,
    marginBottom: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
});

function ConsultationDocument({ patient, consultations }: ConsultationPDFProps) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Patient Consultation Report</Text>
          <Text style={styles.subtitle}>Generated on {generatedDate}</Text>
        </View>

        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{patient.name}</Text>
          </View>
          {patient.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{patient.email}</Text>
            </View>
          )}
          {patient.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{patient.phone}</Text>
            </View>
          )}
          {patient.date_of_birth && (
            <View style={styles.row}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>
                {new Date(patient.date_of_birth).toLocaleDateString()}
              </Text>
            </View>
          )}
          {patient.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{patient.address}</Text>
            </View>
          )}
        </View>

        {/* Consultations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Consultation History ({consultations.length} records)
          </Text>

          {consultations.length === 0 ? (
            <Text style={{ fontSize: 10, color: "#666666", textAlign: "center", padding: 20 }}>
              No consultations recorded yet.
            </Text>
          ) : (
            consultations.map((c) => (
              <View key={c.id} style={styles.consultation}>
                <View style={styles.consultationHeader}>
                  <Text style={styles.consultationDate}>
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.consultationDoctor}>{c.doctor_name}</Text>
                </View>

                {c.diagnosis && (
                  <View>
                    <Text style={styles.fieldLabel}>Diagnosis</Text>
                    <Text style={styles.fieldValue}>{c.diagnosis}</Text>
                  </View>
                )}

                {c.prescription && (
                  <View>
                    <Text style={styles.fieldLabel}>Prescription</Text>
                    <Text style={styles.fieldValue}>{c.prescription}</Text>
                  </View>
                )}

                <View>
                  <Text style={styles.fieldLabel}>Notes</Text>
                  <Text style={styles.fieldValue}>{c.notes}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Doctor Note MVP — Confidential Medical Record</Text>
          <Text>This document is for authorized use only.</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function ConsultationPDF({ patient, consultations }: ConsultationPDFProps) {
  return (
    <PDFDownloadLink
      document={<ConsultationDocument patient={patient} consultations={consultations} />}
      fileName={`${patient.name.replace(/\s+/g, "_")}_consultations.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export PDF
            </span>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
