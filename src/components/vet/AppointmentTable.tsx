"use client";

import React, { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  Dog 
} from "lucide-react";
import { confirmAppointment, cancelAppointment } from "@/actions/vet.actions";
import { toast } from "sonner"; // Assuming sonner is used for toasts
import { AppointmentStatus } from "@prisma/client";
import { useRouter } from "next/router";

interface AppointmentWithDetails {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  reason: string;
  notes?: string | null;
  client: {
    firstName: string;
    lastName: string;
  };
  pet?: {
    name: string;
    species: string;
  } | null;
}

interface AppointmentTableProps {
  initialAppointments: AppointmentWithDetails[];
}

const statusConfig = {
  PENDING: { label: "Pending", variant: "outline" as const, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", variant: "default" as const, color: "text-green-600 bg-green-50 border-green-200" },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const, color: "text-red-600 bg-red-50 border-red-200" },
  DONE: { label: "Completed", variant: "secondary" as const, color: "text-gray-600 bg-gray-50 border-gray-200" },
};

export function AppointmentTable({ initialAppointments }: AppointmentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Filter logic: Search by Pet Name or Owner Name
  const filteredAppointments = useMemo(() => {
    return initialAppointments.filter((app) => {
      const ownerName = `${app.client.firstName} ${app.client.lastName}`.toLowerCase();
      const petName = app.pet?.name.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return ownerName.includes(query) || petName.includes(query);
    });
  }, [initialAppointments, searchQuery]);

  const handleConfirm = async (id: string) => {
    setIsPending(true);
    const result = await confirmAppointment(id);
    if (result.success) {
      toast.success("Appointment confirmed");
      
      router.refresh(); 
    } else {
      toast.error(result.error || "Failed to confirm");
    }
    setIsPending(false);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    setIsPending(true);
    const result = await cancelAppointment(id, "Cancelled by veterinarian");
    if (result.success) {
      toast.success("Appointment cancelled");
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to cancel");
    }
    setIsPending(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Appointments</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your upcoming and past bookings.</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pet or owner..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client / Pet</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(app.startTime).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(app.startTime).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-2 text-sm">
                            <UserIcon className="h-3 w-3" />
                            {app.client.firstName} {app.client.lastName}
                          </span>
                          {app.pet && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Dog className="h-3 w-3" />
                              {app.pet.name} ({app.pet.species})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {app.reason}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusConfig[app.status].variant}
                          className={`${statusConfig[app.status].color} border`}
                        >
                          {statusConfig[app.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {app.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConfirm(app.id)}
                                disabled={isPending}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancel(app.id)}
                                disabled={isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
