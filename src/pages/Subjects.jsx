import { useState } from "react";
import { CLUSTERS } from "@/lib/subjectsClusters";
import ClusterTile from "@/components/subjects/ClusterTile";
import SubjectClusterDetail from "@/components/subjects/SubjectClusterDetail";

export default function Subjects() {
  const [selectedCluster, setSelectedCluster] = useState(null);

  return (
    <div className="px-6 py-5">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Subjects</h1>
        <p className="text-sm text-muted-foreground">Explore learning across 7 skill clusters</p>
      </div>

      {/* Cluster tiles grid */}
      <div className="grid grid-cols-4 gap-4">
        {CLUSTERS.map(cluster => (
          <ClusterTile
            key={cluster.id}
            cluster={cluster}
            onSelect={setSelectedCluster}
          />
        ))}
      </div>

      {/* Cluster detail drill-down */}
      {selectedCluster && (
        <SubjectClusterDetail
          cluster={selectedCluster}
          onClose={() => setSelectedCluster(null)}
        />
      )}
    </div>
  );
}