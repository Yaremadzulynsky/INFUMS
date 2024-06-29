from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.vcs import Github
from diagrams.onprem.ci import GithubActions as Actions
from diagrams.onprem.container import Docker
from diagrams.onprem.client import Client
from diagrams.onprem.iac import Terraform
from diagrams.onprem.vcs import Github
from diagrams.firebase.develop import Functions, RealtimeDatabase, Firestore, Authentication
from diagrams.gcp.compute import Run
from diagrams.gcp.devtools import GCR

with Diagram("Service Interactions", show=False):
    with Cluster("Firebase"):
        realtimeDB = RealtimeDatabase("Realtime Database")
        firestore = Firestore("Firestore")
        authentication = Authentication("Authentication")
        functions = Functions("Functions")
        
        # functions >> Edge() << realtimeDB
    
    client1 = Client("Client 1")
    client2 = Client("Client 2")
    client3 = Client("Client 3")
    
    with Cluster("Drone Fleet"):
        drone1 = Client("Drone 1")
        drone2 = Client("Drone 2")
        drone3 = Client("Drone 3")
        
    satellite = Client("Satellite")
    
    drone1 >> Edge(label="Short Burst Data (SBD)") << satellite
    drone2 >> Edge(label="Short Burst Data (SBD)") << satellite
    drone3 >> Edge(label="Short Burst Data (SBD)") << satellite
    
    satellite >> Edge() << functions
    
    functions >> Edge() >> realtimeDB
    
    server = Client("Mission Logging Server")
    
    server << Edge(label="Listen for Flights") << realtimeDB 
    
    server >> Edge(label="Write Mission Logs") >> firestore
    
    with Cluster("Cloud Run"):
        cloud_run = Run("Google Cloud Run")
        with Cluster("Containers"):
            container1 = Docker("Website Instance 1")
            container2 = Docker("Website Instance 2")
            container3 = Docker("Website Instance 3")
        cloud_run >> Edge(label=" Port 3000") << container1
        cloud_run >> Edge(label=" Port 3000") << container2
        cloud_run >> Edge(label=" Port 3000") << container3
        
        
        container1 >> Edge() << authentication
        container2 >> Edge() << authentication
        container3 >> Edge() << authentication
        
        authentication >> Edge() << firestore
        authentication >> Edge() << realtimeDB
        
        
        
        client1 >> Edge(label="HTTPS (443)") << cloud_run
        client2 >> Edge(label="HTTPS (443)") << cloud_run
        client3 >> Edge(label="HTTPS (443)") << cloud_run
        
        
        
        
    
    # development = Client("Local Development")
    # repository = Github("GitHub Repository")
    # build_deploy = Actions("Build and Deploy")
    # artifacts = GCR("Docker Image Storage")
    
    # docker_image = Docker("Docker Image")
    
    # with Cluster("Google Cloud Run"):
    #     cloud_run = Run("Google Cloud Run")
    #     with Cluster("Containers"):
    #         container1 = Docker("Website Instance 1")
    #         container2 = Docker("Website Instance 2")
    
    
    
    
    # # gcr = GCR("Docker Image Storage")
    
    # development >> Edge(label="Push to Main") >> repository >> Edge(label="Trigger Github Action") >> build_deploy
    
    # build_deploy >> docker_image >> artifacts
    
    # artifacts >> cloud_run >> container1
    
    
    # # github_repo = Git("GitHub Repo")
    # # github_actions = Actions("GitHub Actions")
    # # artifacts = GCR("Docker Image Storage")
    # # githubActions = Actions("Deployment")

        
    
    # # with Cluster("Build and Deploy"):
    # #     # google_auth = CloudBuild("Google Auth")
    # #     # docker_build = CloudBuild("Docker Build")
    # #     # docker_push = CloudBuild("Docker Push")
    # #     # cdktf_deploy = CloudBuild("CDKTF Deploy")
    # #     test = Github("Test")
    
    # # cloud_run = Run("Google Cloud Run")

    # # github_repo >> github_actions >> google_auth >> docker_build >> docker_push >> cdktf_deploy >> cloud_run
