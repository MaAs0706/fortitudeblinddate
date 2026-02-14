import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Reveal() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // session passed from Chat.jsx
    const initialSession = location.state?.session;

    const [sessionData, setSessionData] = useState(initialSession);
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);

    // ⭐ choose your template here

    useEffect(() => {
        const blockBack = () => {
            window.history.pushState(null, "", window.location.href);
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", blockBack);

        return () => window.removeEventListener("popstate", blockBack);
    }, []);


    const exitReveal = async () => {
        await supabase
            .from("users")
            .update({
                ismatched: false
            })
            .eq("id", user.id);

        navigate("/denied", { replace: true });
    };

    /* =========================================================
       LOAD SESSION + PARTNER + REALTIME
    ========================================================= */
    useEffect(() => {
        if (!initialSession?.id || !user?.id) {
            navigate("/");
            return;
        }

        const loadEverything = async () => {
            // 1️⃣ Fetch latest session
            const { data, error } = await supabase
                .from("sessions")
                .select("*")
                .eq("id", initialSession.id)
                .single();

            if (!data || error) {
                console.error(error);
                return;
            }

            setSessionData(data);

            // 2️⃣ Determine partner id
            const isUserA = user.id === data.user_a;
            const partnerId = isUserA ? data.user_b : data.user_a;

            // 3️⃣ Fetch partner profile
            const { data: partnerData } = await supabase
                .from("users")
                .select("id, firstName, lastName, gender, year, phoneno, reveal_theme, instagram_id")
                .eq("id", partnerId)
                .single();

            if (partnerData) {
                setPartner(partnerData);
            }

            setLoading(false);
        };

        loadEverything();
        console.log(partner)
        // ⭐ Realtime listener for session updates
        const channel = supabase
            .channel(`reveal-sync-${initialSession.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sessions",
                    filter: `id=eq.${initialSession.id}`,
                },
                (payload) => {
                    setSessionData(payload.new);
                }
            )
            .subscribe();

        const timer = setTimeout(() => setIsActive(true), 100);

        return () => {
            clearTimeout(timer);
            supabase.removeChannel(channel);
        };
    }, [initialSession?.id, user?.id, navigate]);

    /* =========================================================
       REVEAL LOGIC
    ========================================================= */

    const isUserA = user?.id === sessionData?.user_a;
    const template = partner?.reveal_theme || "cinematic"
    const bothAgreed =
        sessionData?.reveal_a === true &&
        sessionData?.reveal_b === true;

    const anyoneDenied =
        sessionData?.reveal_a === false ||
        sessionData?.reveal_b === false;

    // ⭐ Auto redirect if anyone denied
    useEffect(() => {
        if (anyoneDenied) {
            navigate("/denied", { replace: true });
        }
    }, [anyoneDenied, navigate]);

    // ⭐ Did partner share phone?
    const partnerSharedPhone = isUserA
        ? sessionData?.phone_reveal_b
        : sessionData?.phone_reveal_a;

    /* =========================================================
       LOADING STATE
    ========================================================= */
    if (loading || !partner) {
        return (
            <div className="h-screen bg-[#0c111f] flex items-center justify-center text-[#ed9e6f] font-mono uppercase tracking-widest animate-pulse">
                ✦ Synchronizing...
            </div>
        );
    }

    /* =========================================================
       WAITING STATE
    ========================================================= */
    if (!bothAgreed && !anyoneDenied) {
        return (
            <div className="h-screen bg-[#0c111f] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border-2 border-[#ed9e6f]/20 border-t-[#ed9e6f] rounded-full animate-spin mb-6" />
                <h2
                    className="text-xl text-[#ed9e6f] font-bold mb-2 tracking-tighter"
                    style={{ fontFamily: "Satisfy, cursive" }}
                >
                    Waiting for the Echo...
                </h2>
                <p className="text-white/40 text-xs uppercase tracking-widest max-w-[200px]">
                    The connection is pending your partner's final choice.
                </p>
                <button
                    onClick={exitReveal}
                    className="mt-12 text-white/20 text-[10px] uppercase tracking-[0.3em] border-b border-white/5 pb-1"
                >
                    Abandon Reveal
                </button>
            </div>
        );
    }

    /* =========================================================
       TEMPLATE IMAGE
    ========================================================= */
    const templateImage =
        partner.gender === "female"
            ? "/assets/female.png"
            : "/assets/male.png";

    /* =========================================================
       FINAL REVEAL UI
    ========================================================= */
    return (
        <div className={`reveal-container ${template} ${isActive ? "active" : ""}`}>
            {template === "cinematic" && (
                <>
                    <div className="cinema-bar top"></div>
                    <div className="cinema-bar bottom"></div>
                </>
            )}

            {template === "expressive" && (
                <div className="ink-drops">
                    <div className="drop d1"></div>
                    <div className="drop d2"></div>
                </div>
            )}

            <div className="card-wrapper">
                <div className="identity-card relative">
                    <img
                        src={templateImage}
                        alt="Identity Template"
                        className="template-base"
                    />

                    <div className="details-overlay">
                        <div className="vertical-label">
                            STUDENT ✦ {partner.gender?.toUpperCase()}
                        </div>

                        <div className="info-block">
                            <h2 className="reveal-name">
                                {`${partner.firstName} ${partner.lastName}`}
                            </h2>

                            <p className="reveal-meta text-[11px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">
                                {partner.year} • {partner.gender}
                            </p>

                            <div className="contact-box">
                                <p className="text-[9px] font-bold text-black/20 uppercase tracking-tighter mb-1">
                                    Contact Number
                                </p>
                                <span className="value">
                                    {partnerSharedPhone
                                        ? partner.phoneno ||
                                        "No Number Shared"
                                        : "Identity Only"}
                                </span>


                            </div>


                        </div>

                        {partner.instagram_id && (
                            <p className="absolute bottom-5 right-5 text-[10px] text-black/35 tracking-[0.2em] italic select-none">
                                @{partner.instagram_id}
                            </p>
                        )}
                    </div>

                </div>
            </div>

            <button
                onClick={() => navigate("/basic")}
                className="absolute bottom-10 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-[#ed9e6f] hover:border-[#ed9e6f]/30 transition-all z-50"
            >
                Close Connection
            </button>
        </div>
    );
}
