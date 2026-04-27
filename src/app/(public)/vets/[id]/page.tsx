export default function VetProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-24">
      <h1 className="text-3xl font-bold">Veterinarian Profile</h1>
      <p>Viewing details for vet ID: {params.id}</p>
    </div>
  );
}
