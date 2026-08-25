import { NextResponse } from "next/server";

export const POST = async () => {
    return NextResponse.json(
        { error: "Stripe webhook support removed" },
        { status: 410 }
    );
};
