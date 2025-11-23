// File: app/api/upload-auth/route.ts
import { getImageKitUploadAuth } from "@/lib/actions"

export async function GET() {
    try {
        // Add your authentication logic here
        // For example, check if user is logged in or has necessary permissions

        const authParams = await getImageKitUploadAuth()

        return Response.json(authParams)
    } catch (error) {
        console.error("Error generating upload auth:", error)
        return Response.json(
            { error: "Failed to generate upload authentication" },
            { status: 500 }
        )
    }
}
