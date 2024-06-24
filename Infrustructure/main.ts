import { Construct } from "constructs";
import {
  App,
  TerraformStack,
  TerraformOutput,
  CloudBackend,
  NamedCloudWorkspace,
} from "cdktf";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { CloudRunService } from "@cdktf/provider-google/lib/cloud-run-service";
import { CloudRunServiceIamPolicy } from "@cdktf/provider-google/lib/cloud-run-service-iam-policy";
import { DataGoogleIamPolicy } from "@cdktf/provider-google/lib/data-google-iam-policy";
import { config } from "dotenv";

config();

const imageURI = process.env.IMAGE_URI || "";
const gcpToken = process.env.AUTH_TOKEN || "{}";
const region = process.env.REGION || ""; //region
const projectId = process.env.PROJECT_ID || "";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new GoogleProvider(this, "GoogleAuth", {
      region: region,
      zone: region + "-c",
      project: projectId,
      accessToken: gcpToken,
    });

    const cloudrunsvcapp = new CloudRunService(this, "GcpCDKCloudrunsvc", {
      location: region,
      name: "gcpcdktfcloudrunsvc2020",
      template: {
        spec: {
          containers: [
            {
              ports: [{ containerPort: 3000 }],
              image: imageURI,
              env: [
                {
                  name: "NEXT_PUBLIC_FIREBASE_CONFIG",
                  value: process.env.NEXT_PUBLIC_FIREBASE_CONFIG || "",
                },
                {
                  name: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
                  value: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
                },
              ],
            },
          ],
        },
      },
    });

    const policy_data = new DataGoogleIamPolicy(this, "datanoauth", {
      binding: [
        {
          role: "roles/run.invoker",
          members: ["allUsers"],
        },
      ],
    });

    new CloudRunServiceIamPolicy(this, "runsvciampolicy", {
      location: region,
      project: cloudrunsvcapp.project,
      service: cloudrunsvcapp.name,
      policyData: policy_data.policyData,
    });

    new TerraformOutput(this, "cdktfcloudrunUrl", {
      value: "${" + cloudrunsvcapp.fqn + ".status[0].url}",
    });

    new TerraformOutput(this, "cdktfcloudrunUrlN", {
      value: cloudrunsvcapp.status.get(0).url,
    });
  }
}

const app = new App();
const stack = new MyStack(app, "GCP-CDKTF-CloudRun");
new CloudBackend(stack, {
  hostname: "app.terraform.io",
  organization: "ydzulynsky",
  workspaces: new NamedCloudWorkspace("Infrustructure"),
});
app.synth();
