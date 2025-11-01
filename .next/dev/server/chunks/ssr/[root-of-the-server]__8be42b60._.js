module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/components/ChatWindow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function ChatWindow({ messages, isLoading = false, onStarterPromptClick }) {
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const scrollToBottom = ()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setIsClient(true);
        scrollToBottom();
    }, [
        messages
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 overflow-y-auto overscroll-contain",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-4 space-y-3",
                children: [
                    messages.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center text-center py-8 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-h2 font-medium text-textMain",
                                        children: "Clinical Support System"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChatWindow.tsx",
                                        lineNumber: 45,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-body text-textSubtle max-w-md",
                                        children: "Begin a consultation by selecting a topic or typing your concern."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChatWindow.tsx",
                                        lineNumber: 48,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ChatWindow.tsx",
                                lineNumber: 44,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-2",
                                children: [
                                    "I'm feeling anxious and need coping strategies",
                                    "I'm having trouble sleeping lately",
                                    "I want to improve my mental health routine",
                                    "I'm struggling with stress management"
                                ].map((prompt, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            onStarterPromptClick?.(prompt);
                                            const announcer = document.getElementById("sr-announcer");
                                            if (announcer) announcer.textContent = `Sent message: ${prompt}`;
                                        },
                                        className: "p-3 bg-surfaceAlt border border-border rounded-md transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary hover:bg-gray-100",
                                        "aria-label": `Start conversation: ${prompt}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-textMain",
                                            children: prompt
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChatWindow.tsx",
                                            lineNumber: 73,
                                            columnNumber: 21
                                        }, this)
                                    }, idx, false, {
                                        fileName: "[project]/src/components/ChatWindow.tsx",
                                        lineNumber: 62,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChatWindow.tsx",
                                lineNumber: 55,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full max-w-2xl bg-surfaceAlt border border-border rounded-md p-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Note:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChatWindow.tsx",
                                            lineNumber: 81,
                                            columnNumber: 19
                                        }, this),
                                        " This system provides guidance but is not a replacement for professional medical care."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ChatWindow.tsx",
                                    lineNumber: 80,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChatWindow.tsx",
                                lineNumber: 79,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ChatWindow.tsx",
                        lineNumber: 42,
                        columnNumber: 13
                    }, this) : messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border ${message.role === "user" ? "bg-gray-100 border-border text-textSubtle" : "bg-primary/10 border-primary/20 text-primary"}`,
                                    "aria-hidden": "true",
                                    children: message.role === "user" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "h-4 w-4 flex-shrink-0",
                                        width: "16",
                                        height: "16",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChatWindow.tsx",
                                            lineNumber: 112,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChatWindow.tsx",
                                        lineNumber: 104,
                                        columnNumber: 21
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "h-4 w-4 flex-shrink-0",
                                        width: "16",
                                        height: "16",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: 2,
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChatWindow.tsx",
                                            lineNumber: 129,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChatWindow.tsx",
                                        lineNumber: 120,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatWindow.tsx",
                                    lineNumber: 95,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `rounded-md px-3 py-2 break-words overflow-wrap-anywhere ${message.role === "user" ? "bg-surfaceAlt border border-border" : message.role === "system" ? "bg-blue-50 border border-primary/20" : "bg-surface border border-border"}`,
                                        children: [
                                            message.riskLevel && message.riskLevel !== "low" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 mb-2 text-caption font-medium",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `inline-block w-2 h-2 rounded-full ${message.riskLevel === "critical" ? "bg-danger animate-pulseSlow" : message.riskLevel === "high" ? "bg-warning" : "bg-yellow-500"}`,
                                                        "aria-hidden": "true"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ChatWindow.tsx",
                                                        lineNumber: 151,
                                                        columnNumber: 25
                                                    }, this),
                                                    message.riskLevel === "critical" && "URGENT",
                                                    message.riskLevel === "high" && "Important",
                                                    message.riskLevel === "moderate" && "Note"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/ChatWindow.tsx",
                                                lineNumber: 150,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-body text-textMain leading-relaxed break-words whitespace-normal",
                                                children: message.text
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChatWindow.tsx",
                                                lineNumber: 166,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-caption text-textMuted mt-1",
                                                children: isClient ? new Date(message.timestamp).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                }) : ""
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChatWindow.tsx",
                                                lineNumber: 169,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ChatWindow.tsx",
                                        lineNumber: 140,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatWindow.tsx",
                                    lineNumber: 139,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, message.id, true, {
                            fileName: "[project]/src/components/ChatWindow.tsx",
                            lineNumber: 88,
                            columnNumber: 15
                        }, this)),
                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary",
                                "aria-hidden": "true",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "h-4 w-4 flex-shrink-0",
                                    width: "16",
                                    height: "16",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: 2,
                                    viewBox: "0 0 24 24",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChatWindow.tsx",
                                        lineNumber: 199,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatWindow.tsx",
                                    lineNumber: 190,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChatWindow.tsx",
                                lineNumber: 186,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-surface border border-border rounded-md px-3 py-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5",
                                    role: "status",
                                    "aria-label": "Processing",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChatWindow.tsx",
                                            lineNumber: 212,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 bg-primary rounded-full animate-bounce",
                                            style: {
                                                animationDelay: "0.15s"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChatWindow.tsx",
                                            lineNumber: 213,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 bg-primary rounded-full animate-bounce",
                                            style: {
                                                animationDelay: "0.3s"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChatWindow.tsx",
                                            lineNumber: 217,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ChatWindow.tsx",
                                    lineNumber: 207,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChatWindow.tsx",
                                lineNumber: 206,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ChatWindow.tsx",
                        lineNumber: 185,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: messagesEndRef
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChatWindow.tsx",
                        lineNumber: 225,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChatWindow.tsx",
                lineNumber: 40,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ChatWindow.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ChatWindow.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/VoiceInput.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VoiceInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function VoiceInput({ onTranscribed, language, disabled = false }) {
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSupported, setIsSupported] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const handleToggle = async ()=>{
        // Check for browser support
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setIsSupported(false);
            alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
            return;
        }
        if (isListening) {
            setIsListening(false);
            return;
        }
        try {
            // @ts-ignore - webkitSpeechRecognition is not in TypeScript types
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            // Set language based on current selection
            const langMap = {
                en: "en-US",
                ar_egy: "ar-EG",
                ar_msa: "ar-SA"
            };
            recognition.lang = langMap[language] || "en-US";
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onstart = ()=>{
                setIsListening(true);
            };
            recognition.onresult = (event)=>{
                const transcript = event.results[0][0].transcript;
                onTranscribed(transcript);
                setIsListening(false);
            };
            recognition.onerror = (event)=>{
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
                if (event.error === "no-speech") {
                    alert("No speech detected. Please try again.");
                } else if (event.error === "not-allowed") {
                    alert("Microphone access denied. Please allow microphone access in your browser settings.");
                }
            };
            recognition.onend = ()=>{
                setIsListening(false);
            };
            recognition.start();
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            setIsListening(false);
        }
    };
    if (!isSupported) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full p-3 bg-gray-200 text-gray-500 rounded-xl text-center text-sm",
            children: "Voice input not supported in this browser"
        }, void 0, false, {
            fileName: "[project]/src/components/VoiceInput.tsx",
            lineNumber: 88,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: handleToggle,
        disabled: disabled,
        className: `px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center flex-shrink-0 shadow-sm text-sm border ${isListening ? "bg-red-50 text-danger border-danger" : disabled ? "bg-gray-100 text-textMuted cursor-not-allowed border-border" : "bg-surface text-textMain border-border hover:bg-surfaceAlt"}`,
        title: isListening ? "Click to stop" : "Press to speak",
        "aria-label": isListening ? "Stop recording" : "Start voice input",
        children: isListening ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5 flex-shrink-0 animate-pulse",
            width: "20",
            height: "20",
            fill: "currentColor",
            viewBox: "0 0 20 20",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                fillRule: "evenodd",
                d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z",
                clipRule: "evenodd"
            }, void 0, false, {
                fileName: "[project]/src/components/VoiceInput.tsx",
                lineNumber: 116,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/VoiceInput.tsx",
            lineNumber: 109,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5 flex-shrink-0",
            width: "20",
            height: "20",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            }, void 0, false, {
                fileName: "[project]/src/components/VoiceInput.tsx",
                lineNumber: 131,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/VoiceInput.tsx",
            lineNumber: 123,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/VoiceInput.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/session/sessionManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearAllSessions",
    ()=>clearAllSessions,
    "deleteSession",
    ()=>deleteSession,
    "exportSession",
    ()=>exportSession,
    "exportSessionAsText",
    ()=>exportSessionAsText,
    "getSession",
    ()=>getSession,
    "getSessionStats",
    ()=>getSessionStats,
    "getSessions",
    ()=>getSessions,
    "saveSession",
    ()=>saveSession
]);
const STORAGE_KEY = "ai_meta_clinician_sessions";
const MAX_SESSIONS = 10; // Keep last 10 sessions
const SESSION_EXPIRY_DAYS = 90; // Delete after 90 days
function saveSession(session) {
    try {
        const sessions = getSessions();
        // Remove old sessions (>90 days)
        const validSessions = sessions.filter((s)=>{
            const daysSinceUpdate = (Date.now() - new Date(s.lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceUpdate < SESSION_EXPIRY_DAYS;
        });
        // Find existing session or add new one
        const existingIndex = validSessions.findIndex((s)=>s.id === session.id);
        if (existingIndex >= 0) {
            validSessions[existingIndex] = session;
        } else {
            validSessions.push(session);
        }
        // Keep only MAX_SESSIONS most recent
        const recentSessions = validSessions.sort((a, b)=>new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()).slice(0, MAX_SESSIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSessions));
    } catch (error) {
        console.error("Error saving session:", error);
    }
}
function getSessions() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const sessions = JSON.parse(data);
        return sessions;
    } catch (error) {
        console.error("Error loading sessions:", error);
        return [];
    }
}
function getSession(id) {
    const sessions = getSessions();
    return sessions.find((s)=>s.id === id) || null;
}
function deleteSession(id) {
    try {
        const sessions = getSessions();
        const filtered = sessions.filter((s)=>s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error("Error deleting session:", error);
    }
}
function clearAllSessions() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Error clearing sessions:", error);
    }
}
function exportSession(session) {
    try {
        const dataStr = JSON.stringify(session, null, 2);
        const dataBlob = new Blob([
            dataStr
        ], {
            type: "application/json"
        });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `session_${session.id}_${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error exporting session:", error);
    }
}
function exportSessionAsText(session) {
    try {
        let transcript = `AI Meta-Clinician - Session Transcript\n`;
        transcript += `========================================\n\n`;
        transcript += `Session ID: ${session.id}\n`;
        transcript += `Start Time: ${session.startTime.toLocaleString()}\n`;
        transcript += `Language: ${session.language}\n`;
        transcript += `Risk Level: ${session.riskLevel}\n`;
        transcript += `Flagged for Review: ${session.flaggedForReview ? "Yes" : "No"}\n\n`;
        transcript += `========================================\n\n`;
        session.messages.forEach((msg)=>{
            const role = msg.role === "user" ? "YOU" : msg.role === "ai" ? "AI CLINICIAN" : "SYSTEM";
            transcript += `[${msg.timestamp.toLocaleTimeString()}] ${role}:\n`;
            transcript += `${msg.text}\n\n`;
            if (msg.riskLevel && msg.riskLevel !== "low") {
                transcript += `⚠️ Risk Level: ${msg.riskLevel.toUpperCase()}\n\n`;
            }
        });
        transcript += `========================================\n`;
        transcript += `End of Transcript\n`;
        const dataBlob = new Blob([
            transcript
        ], {
            type: "text/plain"
        });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `session_${session.id}_${new Date().toISOString()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error exporting session as text:", error);
    }
}
function getSessionStats(session) {
    const userMessages = session.messages.filter((m)=>m.role === "user").length;
    const aiMessages = session.messages.filter((m)=>m.role === "ai").length;
    const duration = new Date(session.lastUpdate).getTime() - new Date(session.startTime).getTime();
    const durationMinutes = Math.round(duration / (1000 * 60));
    return {
        totalMessages: session.messages.length,
        userMessages,
        aiMessages,
        durationMinutes,
        riskLevel: session.riskLevel,
        flagged: session.flaggedForReview
    };
}
}),
"[project]/src/components/SessionHistory.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SessionHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session/sessionManager.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function SessionHistory({ onLoadSession, onClose }) {
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSessions"])());
    const [selectedSession, setSelectedSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleDelete = (id)=>{
        if (confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteSession"])(id);
            setSessions((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSessions"])());
            if (selectedSession?.id === id) {
                setSelectedSession(null);
            }
        }
    };
    const handleExportJSON = (session)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportSession"])(session);
    };
    const handleExportText = (session)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportSessionAsText"])(session);
    };
    const getRiskColor = (riskLevel)=>{
        switch(riskLevel){
            case "critical":
                return "bg-red-100 text-red-900 border-red-300";
            case "high":
                return "bg-orange-100 text-orange-900 border-orange-300";
            case "moderate":
                return "bg-yellow-100 text-yellow-900 border-yellow-300";
            default:
                return "bg-green-100 text-green-900 border-green-300";
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-surface border border-border rounded-lg shadow-card max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-primary text-white p-6 flex justify-between items-center border-b border-primary-dark",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-h2 font-semibold",
                                    children: "Session History"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SessionHistory.tsx",
                                    lineNumber: 66,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption opacity-90 mt-1",
                                    children: [
                                        sessions.length,
                                        " saved sessions"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SessionHistory.tsx",
                                    lineNumber: 67,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/SessionHistory.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-white hover:text-blue-200 transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-8 h-8 flex-shrink-0",
                                width: "32",
                                height: "32",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M6 18L18 6M6 6l12 12"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SessionHistory.tsx",
                                    lineNumber: 83,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SessionHistory.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/SessionHistory.tsx",
                            lineNumber: 71,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/SessionHistory.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-1 overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-1/3 border-r border-gray-200 overflow-y-auto p-4 space-y-2",
                            children: sessions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center text-gray-500 py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-16 h-16 mx-auto mb-4 text-gray-300 flex-shrink-0",
                                        width: "64",
                                        height: "64",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SessionHistory.tsx",
                                            lineNumber: 107,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                        lineNumber: 99,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "No sessions yet"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs mt-2",
                                        children: "Start a conversation to create your first session"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                        lineNumber: 115,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/SessionHistory.tsx",
                                lineNumber: 98,
                                columnNumber: 15
                            }, this) : sessions.map((session)=>{
                                const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSessionStats"])(session);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedSession(session),
                                    className: `w-full text-left p-3 rounded-lg border-2 transition-all ${selectedSession?.id === session.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-gray-500",
                                                    children: session.startTime.toLocaleDateString()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SessionHistory.tsx",
                                                    lineNumber: 133,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-xs px-2 py-1 rounded-full ${getRiskColor(session.riskLevel)}`,
                                                    children: session.riskLevel
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SessionHistory.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SessionHistory.tsx",
                                            lineNumber: 132,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-gray-900 mb-1",
                                            children: session.startTime.toLocaleTimeString()
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SessionHistory.tsx",
                                            lineNumber: 144,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-600",
                                            children: [
                                                stats.totalMessages,
                                                " messages • ",
                                                stats.durationMinutes,
                                                " ",
                                                "min"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SessionHistory.tsx",
                                            lineNumber: 147,
                                            columnNumber: 21
                                        }, this),
                                        session.flaggedForReview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-block mt-2 text-xs text-red-600 font-semibold",
                                            children: "⚠️ Flagged for Review"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SessionHistory.tsx",
                                            lineNumber: 152,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, session.id, true, {
                                    fileName: "[project]/src/components/SessionHistory.tsx",
                                    lineNumber: 123,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/SessionHistory.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 overflow-y-auto p-6",
                            children: selectedSession ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6 p-4 bg-gray-50 rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold mb-3",
                                                children: "Session Details"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                lineNumber: 168,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-4 text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-600",
                                                                children: "Session ID:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 173,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "font-mono text-xs",
                                                                children: [
                                                                    selectedSession.id.slice(0, 8),
                                                                    "..."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 174,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-600",
                                                                children: "Language:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 179,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "font-semibold",
                                                                children: selectedSession.language.toUpperCase()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 180,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                                        lineNumber: 178,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-600",
                                                                children: "Started:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 185,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                children: selectedSession.startTime.toLocaleString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 186,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                                        lineNumber: 184,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-600",
                                                                children: "Last Update:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 189,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                children: selectedSession.lastUpdate.toLocaleString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 190,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                                        lineNumber: 188,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                lineNumber: 171,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                        lineNumber: 167,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4 mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold",
                                                children: "Conversation"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                lineNumber: 197,
                                                columnNumber: 19
                                            }, this),
                                            selectedSession.messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `flex ${message.role === "user" ? "justify-end" : "justify-start"}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `max-w-[80%] rounded-md px-3 py-2 border ${message.role === "user" ? "bg-surfaceAlt border-border text-textMain" : message.role === "system" ? "bg-yellow-50 text-textMain border-warning" : "bg-surface text-textMain border-border"}`,
                                                        children: [
                                                            message.riskLevel && message.riskLevel !== "low" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-caption font-medium mb-2 flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: `inline-block w-2 h-2 rounded-full ${message.riskLevel === "critical" ? "bg-danger animate-pulseSlow" : message.riskLevel === "high" ? "bg-warning" : "bg-yellow-500"}`,
                                                                        "aria-hidden": "true"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                                                        lineNumber: 218,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    message.riskLevel.toUpperCase()
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 217,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-body whitespace-pre-wrap",
                                                                children: message.text
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 231,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: `text-xs mt-2 ${message.role === "user" ? "text-blue-200" : "text-gray-400"}`,
                                                                children: new Date(message.timestamp).toLocaleTimeString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                                lineNumber: 234,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 23
                                                    }, this)
                                                }, message.id, false, {
                                                    fileName: "[project]/src/components/SessionHistory.tsx",
                                                    lineNumber: 199,
                                                    columnNumber: 21
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                        lineNumber: 196,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3 flex-wrap",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onLoadSession(selectedSession),
                                                className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors",
                                                children: "Continue Session"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                lineNumber: 250,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleExportJSON(selectedSession),
                                                className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors",
                                                children: "Export JSON"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                lineNumber: 256,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleExportText(selectedSession),
                                                className: "px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors",
                                                children: "Export Transcript"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                lineNumber: 262,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleDelete(selectedSession.id),
                                                className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors",
                                                children: "Delete Session"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SessionHistory.tsx",
                                                lineNumber: 268,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                        lineNumber: 249,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/SessionHistory.tsx",
                                lineNumber: 165,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center justify-center h-full text-gray-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-24 h-24 mb-4 flex-shrink-0",
                                        width: "96",
                                        height: "96",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SessionHistory.tsx",
                                            lineNumber: 286,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                        lineNumber: 278,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg",
                                        children: "Select a session to view details"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SessionHistory.tsx",
                                        lineNumber: 293,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/SessionHistory.tsx",
                                lineNumber: 277,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/SessionHistory.tsx",
                            lineNumber: 163,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/SessionHistory.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/SessionHistory.tsx",
            lineNumber: 62,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/SessionHistory.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/mhgap/rules.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"depression":{"keywords":{"en":["sad","sadness","depressed","depression","hopeless","worthless","tired","exhausted","crying","tearful","empty","numb","unmotivated","guilty","useless","burden","don't enjoy","no interest","lost interest","pleasure","feel nothing","can't feel","feel bad","feel down","feel low","hopelessness","despair","miserable","unhappy","gloomy","dark","heavy","weighed down","drained","fatigued","no energy","lethargic","sluggish","apathetic","indifferent","detached","isolated","alone","lonely","withdrawn","pointless","meaningless","no purpose","give up","giving up","get out of bed","out of bed","stopped eating","stop eating","stopped showering","stopped bathing","stopped caring","lost motivation","no motivation","can't function","not functioning","feels the same","same every day","nothing matters","doesn't matter"],"ar_egy":["حزين","تعبان","مكتئب","يائس","محبط","مش عايز حاجة","عيان","مش قادر","بعيط","حاسس بفراغ","مش نافع","حزن","إحباط","فقدت الأمل","مش مبسوط","مش فرحان","مش حاسس بحاجة","تايه","ضايع","مش لاقى معنى"],"ar_msa":["حزين","كئيب","مكتئب","يائس","منهك","متعب","فاقد الأمل","عديم القيمة","أبكي","فارغ","الحزن","بالحزن","الضياع","ضائع","تائه","اليأس","باليأس","التعب","التعب الشديد","أشعر بالحزن","لا أستمتع","لا أشعر","لا معنى"]},"severity_markers":{"en":["every day","all the time","can't get out of bed","stopped eating","stopped showering","everyday","daily","constantly","always","can't sleep","insomnia","wake up","early morning","stopped caring","don't care","given up","feels the same","nothing changes","no point","can't go on","can't continue","too much","overwhelming","unbearable"],"ar_egy":["كل يوم","طول الوقت","مش قادر اقوم","مش باكل","مش بستحمى","مش قادر انام","مش بنام","كل شوية","دايماً"],"ar_msa":["كل يوم","طوال الوقت","لا أستطيع النهوض","توقفت عن الأكل","النهوض من السرير","من السرير","لا أستطيع النوم","دائماً","باستمرار"]}},"anxiety":{"keywords":{"en":["anxious","anxiety","worried","worry","nervous","panic","scared","afraid","fear","tense","restless","on edge","can't relax","worrying","overthinking","racing thoughts","can't stop thinking","constantly worried","always worried","stressed","stress","pressure","overwhelmed","uneasy","uncomfortable","jittery","jumpy","startled","hypervigilant","agitated","irritable","edgy","frightened","terrified","dread","apprehensive"],"ar_egy":["قلقان","خايف","متوتر","خوف","مرعوب","مش مرتاح","قلق","هلع"],"ar_msa":["قلق","قلقان","خائف","متوتر","خوف","ذعر","مضطرب","متململ","بالقلق","قلق دائم","قلق مستمر","أشعر بالقلق","الخوف","بالخوف","أشعر بالخوف","متوتر جداً","التوتر","نوبة هلع","نوبة ذعر","هلع شديد"]},"panic_symptoms":{"en":["heart racing","can't breathe","chest pain","dizzy","shaking","sweating","heart rate","rapid heart","fast heart","palpitations","pounding heart","breathing","hyperventilating","suffocating","choking","shortness of breath","chest hurt","chest hurts","chest tight","trembling","nausea","nauseous","sick","lightheaded","faint","fainting","unreal","detached","dying","die","thought i was dying","heart attack","panic attack","attack"],"ar_egy":["قلبى بيدق بسرعة","مش قادر اتنفس","وجع فى صدرى","دايخ","بترعش","بعرق"],"ar_msa":["قلبي يدق بسرعة","لا أستطيع التنفس","ألم في صدري","دوار","أرتجف","صدري يؤلمني","يؤلمني","أتعرق","عرق","ظننت أنني سأموت","سأموت","أموت","نوبة","الصدر","في صدري"]}},"psychosis":{"keywords":{"en":["voices","hearing things","seeing things","hallucination","delusion","paranoid","following me","watching me","controlling my thoughts"],"ar_egy":["أصوات","بسمع حاجات","بشوف حاجات","حد بيتابعنى","حد بيراقبنى","بيسيطروا على دماغى","بسمع أصوات","أصوات بتقولى","بتقولى اعمل إيه","اعمل إيه","بشوف ظلال","ظلال","بتتابعنى","فى كل حتة","حاجات غريبة","ناس بيتابعونى","بيراقبونى","بيسيطروا على أفكارى"],"ar_msa":["أصوات","أسمع أشياء","أرى أشياء","هلوسة","ضلالات","يتابعوني","يراقبوني","يسيطرون على أفكاري","أسمع أصواتاً","أصواتاً","أرى ظلالاً","ظلالاً","ظلال","تتبعني","تخبرني","يخبرونني","في كل مكان","يتحكمون"]}},"suicide_risk":{"high_risk":{"en":["kill myself","end my life","suicide","want to die","better off dead","not worth living","plan to die","goodbye"],"ar_egy":["عايز اموت","هنتحر","انتحار","حياتى مالهاش لازمة","عايز اخلص","الموت أحسن"],"ar_msa":["أريد أن أموت","انتحار","سأنتحر","الحياة لا تستحق","أريد إنهاء حياتي","الموت أفضل"]},"moderate_risk":{"en":["no point in living","wish I was dead","life is meaningless","can't go on","no reason to live"],"ar_egy":["حياتى مالهاش معنى","ياريتنى مت","مش عايز اكمل","مفيش سبب اعيش عشانه"],"ar_msa":["حياتي بلا معنى","أتمنى لو كنت ميتاً","لا أستطيع المتابعة","لا سبب للعيش"]},"self_harm":{"en":["cut myself","hurt myself","self-harm","cutting","burning myself","hit myself"],"ar_egy":["بجرح نفسى","بأذى نفسى","بحرق نفسى","بضرب نفسى"],"ar_msa":["أجرح نفسي","أؤذي نفسي","أحرق نفسي","أضرب نفسي","إيذاء ذاتي"]}},"trauma":{"keywords":{"en":["trauma","traumatic","nightmare","nightmares","flashback","flashbacks","abuse","assault","rape","violence","attacked","can't forget","keeps replaying","haunted","haunting","memories","reliving","triggered","trigger","ptsd","post-traumatic","intrusive thoughts","intrusive","startles","jumpy","hyperalert","avoidance","avoiding","reminders","happened to me","terrible thing","awful experience","what happened","accident","car accident","loud noises","loud sounds","reliving","keep replaying","keep seeing","keep thinking about","can't stop seeing","images","visions","abusive","was abusive","domestic violence","partner abused","partner was abusive","feel scared","still scared","can't trust","don't trust","trust anyone","fear","afraid","left but","escaped but","got away but"],"ar_egy":["صدمة","كوابيس","عنف","اعتداء","اغتصاب","مش قادر انسى","بيتكرر قدامى"],"ar_msa":["صدمة","كوابيس","ذكريات مؤلمة","عنف","اعتداء","اغتصاب","لا أستطيع النسيان"]}},"substance_use":{"keywords":{"en":["alcohol","drinking","drugs","cocaine","heroin","marijuana","cannabis","weed","pills","opioids","prescription","medication abuse","substance","addiction","addicted","can't stop","using","high","drunk","intoxicated","withdrawal","cravings","need it","depend on","dependent","abuse","overdose","relapse","cope","coping","numb","numbness","escape","escaping","self-medicate","self-medicating","drink","drank","getting high","getting drunk"],"ar_egy":["مخدرات","شرب","كحول","حشيش","بودرة","إدمان","مش قادر اوقف"],"ar_msa":["مخدرات","كحول","إدمان","لا أستطيع التوقف","تعاطي"]}}});}),
"[project]/src/lib/mhgap/triageEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "triage",
    ()=>triage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/lib/mhgap/rules.json (json)");
;
async function triage(input, lang) {
    const text = input.toLowerCase();
    // Initialize scores
    const scores = {
        depression: 0,
        anxiety: 0,
        psychosis: 0,
        trauma: 0,
        suicideRisk: 0
    };
    const categories = [];
    let riskLevel = "low";
    let flagForReview = false;
    // Check for suicide risk (HIGHEST PRIORITY)
    const suicideCheck = checkSuicideRisk(text, lang);
    scores.suicideRisk = suicideCheck.score;
    if (suicideCheck.level === "critical") {
        categories.push("suicide_risk");
        riskLevel = "critical";
        flagForReview = true;
    } else if (suicideCheck.level === "high") {
        categories.push("suicide_risk");
        riskLevel = "high";
        flagForReview = true;
    } else if (suicideCheck.level === "moderate") {
        categories.push("suicide_risk");
        riskLevel = "moderate";
        flagForReview = true;
    }
    // Check for psychosis symptoms
    scores.psychosis = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].psychosis.keywords[lang]);
    if (scores.psychosis >= 2) {
        categories.push("psychosis");
        if (riskLevel === "low") riskLevel = "high";
        flagForReview = true;
    }
    // Check for depression (lowered threshold from 3 to 2)
    scores.depression = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].depression.keywords[lang]);
    const depressionSeverity = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].depression.severity_markers[lang]);
    if (scores.depression >= 2 || scores.depression >= 1 && depressionSeverity >= 1) {
        categories.push("depression");
        if (riskLevel === "low") riskLevel = "moderate";
        // Escalate to high if severe markers present
        if (depressionSeverity >= 2) riskLevel = "high";
    }
    // Check for anxiety (lowered threshold from 3 to 2)
    scores.anxiety = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].anxiety.keywords[lang]);
    const panicSymptoms = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].anxiety.panic_symptoms[lang]);
    if (scores.anxiety >= 2 || panicSymptoms >= 2) {
        categories.push("anxiety");
        if (riskLevel === "low") riskLevel = "moderate";
        // Escalate to high if panic attack present
        if (panicSymptoms >= 3) riskLevel = "high";
    }
    // Check for trauma
    scores.trauma = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].trauma.keywords[lang]);
    if (scores.trauma >= 2) {
        categories.push("trauma");
        if (riskLevel === "low") riskLevel = "moderate";
    }
    // Generate response text
    const responseText = generateResponse(categories, riskLevel, lang);
    // Generate recommendations
    const recommendations = generateRecommendations(categories, riskLevel, lang);
    return {
        text: responseText,
        category: categories.length > 0 ? categories : [
            "general_inquiry"
        ],
        riskLevel,
        flagForReview,
        score: scores,
        recommendations
    };
}
/**
 * Check for suicide risk indicators
 */ function checkSuicideRisk(text, lang) {
    let score = 0;
    let level = "none";
    // Critical risk indicators
    const criticalMatches = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].suicide_risk.high_risk[lang]);
    if (criticalMatches >= 1) {
        score += criticalMatches * 5;
        level = "critical";
    }
    // Self-harm indicators
    const selfHarmMatches = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].suicide_risk.self_harm[lang]);
    if (selfHarmMatches >= 1) {
        score += selfHarmMatches * 3;
        if (level === "none") level = "high";
    }
    // Moderate risk indicators
    const moderateMatches = countKeywordMatches(text, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$rules$2e$json__$28$json$29$__["default"].suicide_risk.moderate_risk[lang]);
    if (moderateMatches >= 1) {
        score += moderateMatches * 2;
        if (level === "none") level = "moderate";
    }
    return {
        level,
        score
    };
}
/**
 * Count keyword matches in text
 */ function countKeywordMatches(text, keywords) {
    let count = 0;
    for (const keyword of keywords){
        if (text.includes(keyword.toLowerCase())) {
            count++;
        }
    }
    return count;
}
/**
 * Generate appropriate clinical response
 */ function generateResponse(categories, riskLevel, lang) {
    const responses = {
        en: {
            critical: "I'm very concerned about what you've shared. You've mentioned thoughts of ending your life, and I want you to know that you're not alone and help is available. This is a medical emergency. Please contact emergency services immediately (911 or your local emergency number) or go to the nearest emergency room. Would you like me to help you find immediate support resources?",
            high: "I'm hearing that you're going through a very difficult time, and I'm concerned about your safety. The thoughts and feelings you're experiencing are serious, and it's important that you speak with a professional as soon as possible. Are you currently safe? Do you have someone you trust nearby?",
            moderate: "Thank you for sharing what you're going through. It takes courage to open up about these feelings. What you're describing suggests you might be experiencing symptoms that would benefit from professional support. Let's explore this together and discuss some helpful resources.",
            low: "I'm here to listen and support you. Can you tell me more about what's been happening and how you've been feeling lately?",
            general: "Hello, I'm here to help you with your mental health concerns. Feel free to share what's on your mind, and we'll work through this together."
        },
        ar_egy: {
            critical: "أنا قلقان جداً على اللى قولته. انت ذكرت أفكار عن إنهاء حياتك، وعايزك تعرف إنك مش لوحدك والمساعدة متاحة. دى حالة طوارئ طبية. من فضلك اتصل بالطوارئ فوراً أو روح أقرب مستشفى. تحب أساعدك تلاقى موارد دعم فوري؟",
            high: "أنا سامع إنك بتمر بوقت صعب جداً، وأنا قلقان على سلامتك. الأفكار والمشاعر دى خطيرة، ومهم تتكلم مع متخصص في أسرع وقت. انت آمن دلوقتى؟ فيه حد تثق فيه قريب منك؟",
            moderate: "شكراً إنك شاركتنى اللى بتمر بيه. محتاج شجاعة عشان تتكلم عن المشاعر دى. اللى بتوصفه بيقترح إنك ممكن تكون محتاج دعم مهني. يلا نستكشف الموضوع سوا ونتكلم عن موارد مفيدة.",
            low: "أنا هنا عشان أسمعك وأساعدك. ممكن تقولى أكتر عن اللى بيحصل معاك وإزاى كنت حاسس الفترة اللى فاتت؟",
            general: "أهلاً، أنا هنا عشان أساعدك في صحتك النفسية. قول اللى في بالك براحتك، وهنشتغل على ده سوا."
        },
        ar_msa: {
            critical: "أنا قلق جداً مما شاركتني إياه. لقد ذكرت أفكاراً عن إنهاء حياتك، وأريدك أن تعلم أنك لست وحدك وأن المساعدة متاحة. هذه حالة طوارئ طبية. يرجى الاتصال بخدمات الطوارئ فوراً أو التوجه إلى أقرب مستشفى. هل تريد أن أساعدك في إيجاد موارد دعم فوري؟",
            high: "أسمع أنك تمر بوقت صعب جداً، وأنا قلق على سلامتك. الأفكار والمشاعر التي تمر بها خطيرة، ومن المهم أن تتحدث مع متخصص في أسرع وقت ممكن. هل أنت آمن حالياً؟ هل لديك شخص تثق به بالقرب منك؟",
            moderate: "شكراً لمشاركتي ما تمر به. يتطلب الأمر شجاعة للانفتاح حول هذه المشاعر. ما تصفه يشير إلى أنك قد تستفيد من الدعم المهني. دعنا نستكشف هذا معاً ونناقش بعض الموارد المفيدة.",
            low: "أنا هنا للاستماع ودعمك. هل يمكنك إخباري المزيد عما يحدث وكيف كنت تشعر مؤخراً؟",
            general: "مرحباً، أنا هنا لمساعدتك بشأن مخاوفك المتعلقة بالصحة النفسية. لا تتردد في مشاركة ما يدور في ذهنك، وسنعمل على هذا معاً."
        }
    };
    if (riskLevel === "critical") return responses[lang].critical;
    if (riskLevel === "high") return responses[lang].high;
    if (riskLevel === "moderate") return responses[lang].moderate;
    if (categories.length === 0) return responses[lang].general;
    return responses[lang].low;
}
/**
 * Generate clinical recommendations based on assessment
 */ function generateRecommendations(categories, riskLevel, lang) {
    const recommendations = [];
    if (riskLevel === "critical" || riskLevel === "high") {
        recommendations.push("immediate_crisis_intervention");
        recommendations.push("emergency_contact");
        return recommendations;
    }
    if (categories.includes("depression")) {
        recommendations.push("phq9_assessment");
        recommendations.push("behavioral_activation");
        recommendations.push("sleep_hygiene");
    }
    if (categories.includes("anxiety")) {
        recommendations.push("breathing_exercises");
        recommendations.push("gad7_assessment");
        recommendations.push("relaxation_techniques");
    }
    if (categories.includes("psychosis")) {
        recommendations.push("psychiatric_evaluation");
        recommendations.push("medication_assessment");
    }
    if (categories.includes("trauma")) {
        recommendations.push("trauma_informed_care");
        recommendations.push("grounding_techniques");
    }
    return recommendations;
}
}),
"[project]/src/lib/llm/webllmClient.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * WebLLM Client - Local Browser-Based AI Inference
 *
 * This module integrates MLC WebLLM for running Llama-3.2-1B locally in the browser.
 * Benefits:
 * - Complete privacy: No data leaves the user's device
 * - No API costs: Fully local inference
 * - Works offline: No internet required after model download
 * - Low latency: ~100-500ms response time
 *
 * Trade-offs:
 * - Initial model download: ~1-2GB
 * - GPU required for good performance
 * - Limited context window: ~4096 tokens
 */ __turbopack_context__.s([
    "CLINICAL_SYSTEM_PROMPT",
    ()=>CLINICAL_SYSTEM_PROMPT,
    "DEFAULT_CONFIG",
    ()=>DEFAULT_CONFIG,
    "generateClinicalAssessment",
    ()=>generateClinicalAssessment,
    "generateFollowUpQuestions",
    ()=>generateFollowUpQuestions,
    "generateResponse",
    ()=>generateResponse,
    "generateSafetyPlan",
    ()=>generateSafetyPlan,
    "getInitStatus",
    ()=>getInitStatus,
    "getModelInfo",
    ()=>getModelInfo,
    "initLLM",
    ()=>initLLM,
    "isLLMReady",
    ()=>isLLMReady,
    "resetLLM",
    ()=>resetLLM
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mlc$2d$ai$2f$web$2d$llm$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mlc-ai/web-llm/lib/index.js [app-ssr] (ecmascript)");
;
let engine = null;
let isInitializing = false;
let initializationError = null;
const DEFAULT_CONFIG = {
    model: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    temperature: 0.7,
    maxTokens: 512,
    topP: 0.9
};
const CLINICAL_SYSTEM_PROMPT = `You are an AI Mental Health Clinician following WHO mhGAP guidelines. Your role is to:

1. Provide empathetic, culturally-sensitive mental health support
2. Ask clarifying questions to understand symptoms better
3. Use evidence-based assessment frameworks (mhGAP, PHQ-9, GAD-7)
4. Identify risk factors and safety concerns
5. Provide psychoeducation and coping strategies
6. Make appropriate referrals when needed

Important guidelines:
- Always prioritize patient safety
- Use simple, clear language
- Be culturally sensitive
- Never diagnose definitively (suggest professional evaluation)
- If suicide risk detected, provide crisis resources immediately
- Maintain professional boundaries
- Respect patient autonomy

Language support: English, Egyptian Arabic, Modern Standard Arabic
Response style: Warm, professional, non-judgmental`;
async function initLLM(config = {}, onProgress) {
    // Return early if already initialized
    if (engine) {
        return;
    }
    // Wait if initialization is in progress
    if (isInitializing) {
        return new Promise((resolve, reject)=>{
            const checkInterval = setInterval(()=>{
                if (engine) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (initializationError) {
                    clearInterval(checkInterval);
                    reject(initializationError);
                }
            }, 100);
        });
    }
    isInitializing = true;
    initializationError = null;
    try {
        const fullConfig = {
            ...DEFAULT_CONFIG,
            ...config
        };
        // Create engine with progress callback
        engine = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mlc$2d$ai$2f$web$2d$llm$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CreateMLCEngine"](fullConfig.model, {
            initProgressCallback: (report)=>{
                console.log("[WebLLM Init]", report.text, `${report.progress}%`);
                onProgress?.(report);
            }
        });
        console.log("[WebLLM] Engine initialized successfully");
    } catch (error) {
        initializationError = error;
        console.error("[WebLLM] Initialization failed:", error);
        throw error;
    } finally{
        isInitializing = false;
    }
}
function isLLMReady() {
    return engine !== null;
}
function getInitStatus() {
    return {
        isReady: engine !== null,
        isInitializing,
        error: initializationError
    };
}
async function generateResponse(userMessage, conversationHistory = [], options = {}) {
    if (!engine) {
        throw new Error("LLM engine not initialized. Call initLLM() first.");
    }
    const { systemPrompt = CLINICAL_SYSTEM_PROMPT, temperature = DEFAULT_CONFIG.temperature, maxTokens = DEFAULT_CONFIG.maxTokens, stream = false, onProgress } = options;
    // Build message array
    const messages = [
        {
            role: "system",
            content: systemPrompt
        },
        ...conversationHistory,
        {
            role: "user",
            content: userMessage
        }
    ];
    try {
        if (stream && onProgress) {
            // Streaming response
            let fullResponse = "";
            const chunks = await engine.chat.completions.create({
                messages,
                temperature,
                max_tokens: maxTokens,
                stream: true
            });
            for await (const chunk of chunks){
                const delta = chunk.choices[0]?.delta?.content || "";
                fullResponse += delta;
                onProgress(fullResponse);
            }
            return fullResponse;
        } else {
            // Non-streaming response
            const reply = await engine.chat.completions.create({
                messages,
                temperature,
                max_tokens: maxTokens,
                stream: false
            });
            return reply.choices[0]?.message?.content || "";
        }
    } catch (error) {
        console.error("[WebLLM] Generation error:", error);
        throw new Error(`Failed to generate response: ${error}`);
    }
}
async function generateClinicalAssessment(userInput, triageResult, language = "en", conversationHistory = []) {
    const maxScore = Math.max(...Object.values(triageResult.score));
    const enhancedSystemPrompt = `${CLINICAL_SYSTEM_PROMPT}

Current triage analysis:
- Detected concerns: ${triageResult.category.join(", ")}
- Risk level: ${triageResult.riskLevel}
- Symptom scores: Depression ${triageResult.score.depression}, Anxiety ${triageResult.score.anxiety}, Psychosis ${triageResult.score.psychosis}, Trauma ${triageResult.score.trauma}, Suicide Risk ${triageResult.score.suicideRisk}
- Max score: ${maxScore}
- Language: ${language}

Based on this triage, provide a compassionate, clinically-informed response that:
1. Acknowledges the person's concerns
2. Asks 2-3 clarifying questions to better understand their situation
3. Provides relevant psychoeducation
4. Suggests appropriate next steps
5. If high risk, emphasize safety and provide crisis resources

Response language: ${language === "en" ? "English" : language === "ar_egy" ? "Egyptian Arabic" : "Modern Standard Arabic"}`;
    return generateResponse(userInput, conversationHistory, {
        systemPrompt: enhancedSystemPrompt,
        temperature: 0.7,
        maxTokens: 512
    });
}
async function generateFollowUpQuestions(symptoms, language = "en") {
    const prompt = `Generate 3 clinically-relevant follow-up questions to assess: ${symptoms.join(", ")}. 
  
Questions should be:
- Open-ended (not yes/no)
- Culturally sensitive
- Focused on severity, duration, impact
- In ${language === "en" ? "English" : language === "ar_egy" ? "Egyptian Arabic" : "Modern Standard Arabic"}

Format: Return only the questions, one per line, numbered 1-3.`;
    const response = await generateResponse(prompt, [], {
        temperature: 0.8,
        maxTokens: 256
    });
    // Parse response into array
    return response.split("\n").filter((line)=>line.trim().match(/^\d+[\.\)]/)).map((line)=>line.replace(/^\d+[\.\)]\s*/, "").trim()).slice(0, 3);
}
async function generateSafetyPlan(userContext, language = "en") {
    const prompt = `Based on this context: "${userContext}"

Create a personalized safety plan in ${language === "en" ? "English" : language === "ar_egy" ? "Egyptian Arabic" : "Modern Standard Arabic"} with these sections:

1. Warning signs (3 items)
2. Internal coping strategies (3 items)
3. People to contact for support (3 types)
4. Professional resources (3 options)
5. Making environment safe (3 steps)

Format: Use clear headings and bullet points.`;
    const response = await generateResponse(prompt, [], {
        temperature: 0.6,
        maxTokens: 512
    });
    // Parse response (simplified - in production, use more robust parsing)
    return {
        warningSign: [],
        copingStrategies: [],
        supportContacts: [],
        professionalResources: [],
        environmentSafety: []
    };
}
async function resetLLM() {
    if (engine) {
        try {
            // WebLLM doesn't have explicit cleanup, but we can reset
            engine = null;
            initializationError = null;
            isInitializing = false;
            console.log("[WebLLM] Engine reset");
        } catch (error) {
            console.error("[WebLLM] Reset error:", error);
        }
    }
}
function getModelInfo() {
    return {
        model: DEFAULT_CONFIG.model,
        isReady: engine !== null,
        capabilities: [
            "Local inference (no API calls)",
            "Privacy-preserving (no data sent to cloud)",
            "Multilingual support (EN, AR)",
            "Clinical reasoning",
            "Follow-up question generation",
            "Safety planning",
            "Psychoeducation"
        ]
    };
}
}),
"[project]/src/app/ar-egy/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EgyptianArabicPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChatWindow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ChatWindow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$VoiceInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/VoiceInput.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SessionHistory$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/SessionHistory.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$triageEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mhgap/triageEngine.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$webllmClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/webllmClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session/sessionManager.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
function EgyptianArabicPage() {
    const language = "ar_egy"; // Fixed to Egyptian Arabic
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [inputText, setInputText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isProcessing, setIsProcessing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [riskAlert, setRiskAlert] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sessionId, setSessionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>`session-${Date.now()}`);
    const [showHistory, setShowHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [llmStatus, setLlmStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        isReady: false,
        isInitializing: false,
        progress: ""
    });
    const [useLLM, setUseLLM] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Initialize WebLLM on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const checkLLMStatus = ()=>{
            const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$webllmClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInitStatus"])();
            setLlmStatus({
                isReady: status.isReady,
                isInitializing: status.isInitializing,
                progress: ""
            });
        };
        checkLLMStatus();
        const interval = setInterval(checkLLMStatus, 1000);
        return ()=>clearInterval(interval);
    }, []);
    const handleSendMessage = async (text)=>{
        if (!text.trim() || isProcessing) return;
        setIsProcessing(true);
        const userMessage = {
            role: "user",
            content: text,
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                userMessage
            ]);
        setInputText("");
        try {
            // Run triage
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mhgap$2f$triageEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triage"])(text, language);
            // Check for risk alerts
            if (result.riskLevel && result.riskLevel !== "low") {
                setRiskAlert({
                    level: result.riskLevel,
                    message: result.riskLevel === "critical" ? "⚠️ عاجل: في أزمة! اتصل بالطوارئ حالاً." : result.riskLevel === "high" ? "⚠️ في خطر كبير. لازم تروح لدكتور قريب." : "ملاحظة: في حاجات مش مطمئنة. يفضل تستشير حد متخصص."
                });
            }
            // Generate AI response
            let aiResponse = result.response;
            if (useLLM && llmStatus.isReady) {
                try {
                    const llmResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$webllmClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateClinicalAssessment"])(text, result.response, language);
                    aiResponse = llmResponse || result.response;
                } catch (error) {
                    console.error("LLM generation failed, using fallback:", error);
                }
            }
            const assistantMessage = {
                role: "assistant",
                content: aiResponse,
                timestamp: new Date()
            };
            setMessages((prev)=>[
                    ...prev,
                    assistantMessage
                ]);
            // Save session
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2f$sessionManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveSession"])({
                id: sessionId,
                messages: [
                    ...messages,
                    userMessage,
                    assistantMessage
                ],
                language,
                startTime: new Date(),
                lastActivity: new Date(),
                riskLevel: result.riskLevel || "low"
            });
        } catch (error) {
            console.error("Error processing message:", error);
            const errorMessage = {
                role: "assistant",
                content: "آسف، حصل خطأ. جرب تاني أو كلم الدعم لو المشكلة فضلت.",
                timestamp: new Date()
            };
            setMessages((prev)=>[
                    ...prev,
                    errorMessage
                ]);
        } finally{
            setIsProcessing(false);
        }
    };
    const handleVoiceInput = (transcript)=>{
        setInputText(transcript);
    };
    const handleNewSession = ()=>{
        setMessages([]);
        setSessionId(`session-${Date.now()}`);
        setRiskAlert(null);
    };
    const handleLoadSession = (session)=>{
        setMessages(session.messages);
        setSessionId(session.id);
        setShowHistory(false);
        if (session.riskLevel && session.riskLevel !== "low") {
            setRiskAlert({
                level: session.riskLevel,
                message: "مستوى خطر الجلسة السابقة: " + session.riskLevel
            });
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col",
        dir: "rtl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-subtle bg-white sticky top-0 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 py-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold text-primary",
                                        children: "الدكتور الذكي للصحة النفسية"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ar-egy/page.tsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: "منصة الدعم النفسي - العامية المصرية"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ar-egy/page.tsx",
                                        lineNumber: 164,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/",
                                        className: "px-4 py-2 text-sm border border-subtle rounded hover:bg-subtle transition",
                                        children: "غيّر اللغة"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ar-egy/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowHistory(!showHistory),
                                        className: "px-4 py-2 text-sm border border-subtle rounded hover:bg-subtle transition",
                                        children: [
                                            showHistory ? "خبّي" : "اعرض",
                                            " السجل"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/ar-egy/page.tsx",
                                        lineNumber: 175,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleNewSession,
                                        className: "px-4 py-2 text-sm bg-primary text-white rounded hover:opacity-90 transition",
                                        children: "جلسة جديدة"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ar-egy/page.tsx",
                                        lineNumber: 181,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                lineNumber: 168,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/ar-egy/page.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/ar-egy/page.tsx",
                    lineNumber: 158,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/ar-egy/page.tsx",
                lineNumber: 157,
                columnNumber: 7
            }, this),
            riskAlert && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${riskAlert.level === "critical" ? "bg-red-50 border-red-200 text-red-800" : riskAlert.level === "high" ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"} border-b px-4 py-3`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium",
                            children: riskAlert.message
                        }, void 0, false, {
                            fileName: "[project]/src/app/ar-egy/page.tsx",
                            lineNumber: 204,
                            columnNumber: 13
                        }, this),
                        riskAlert.level === "critical" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-2 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "أرقام الطوارئ:"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/ar-egy/page.tsx",
                                    lineNumber: 207,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "mt-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "🇪🇬 مصر: 08008880700 (خط الحياة)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ar-egy/page.tsx",
                                            lineNumber: 209,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "🌍 دولي: findahelpline.com"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ar-egy/page.tsx",
                                            lineNumber: 210,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/ar-egy/page.tsx",
                                    lineNumber: 208,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/ar-egy/page.tsx",
                            lineNumber: 206,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/ar-egy/page.tsx",
                    lineNumber: 203,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/ar-egy/page.tsx",
                lineNumber: 194,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 container mx-auto px-4 py-6 flex gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChatWindow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                messages: messages,
                                language: language,
                                isProcessing: isProcessing
                            }, void 0, false, {
                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                lineNumber: 222,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 border border-subtle rounded-lg p-4 bg-white",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2 mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleSendMessage(inputText),
                                                disabled: isProcessing || !inputText.trim(),
                                                className: "px-6 py-2 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition",
                                                children: "إرسال"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                                lineNumber: 231,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$VoiceInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                language: language,
                                                onTranscript: handleVoiceInput,
                                                disabled: isProcessing
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                                lineNumber: 238,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: inputText,
                                                onChange: (e)=>setInputText(e.target.value),
                                                onKeyPress: (e)=>{
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(inputText);
                                                    }
                                                },
                                                placeholder: "اكتب رسالتك هنا...",
                                                className: "flex-1 px-4 py-2 border border-subtle rounded focus:outline-none focus:ring-2 focus:ring-primary",
                                                disabled: isProcessing
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                                lineNumber: 243,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/ar-egy/page.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "flex items-center gap-2 cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "رد محسّن بالذكاء الاصطناعي",
                                                        llmStatus.isInitializing && " (بيجهز...)",
                                                        !llmStatus.isReady && !llmStatus.isInitializing && " (مش متاح)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/ar-egy/page.tsx",
                                                    lineNumber: 262,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: useLLM,
                                                    onChange: (e)=>setUseLLM(e.target.checked),
                                                    disabled: !llmStatus.isReady,
                                                    className: "rounded"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ar-egy/page.tsx",
                                                    lineNumber: 269,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/ar-egy/page.tsx",
                                            lineNumber: 261,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ar-egy/page.tsx",
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                lineNumber: 229,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/ar-egy/page.tsx",
                        lineNumber: 221,
                        columnNumber: 9
                    }, this),
                    showHistory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "w-80",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SessionHistory$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            onLoadSession: handleLoadSession,
                            currentSessionId: sessionId
                        }, void 0, false, {
                            fileName: "[project]/src/app/ar-egy/page.tsx",
                            lineNumber: 284,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/ar-egy/page.tsx",
                        lineNumber: 283,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/ar-egy/page.tsx",
                lineNumber: 219,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "border-t border-subtle py-4 text-center text-sm text-gray-600",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "⚠️ ده مش بديل للعلاج النفسي الحقيقي"
                    }, void 0, false, {
                        fileName: "[project]/src/app/ar-egy/page.tsx",
                        lineNumber: 294,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1",
                        children: [
                            "لو في أزمة، اتصل بـ ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "08008880700"
                            }, void 0, false, {
                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                lineNumber: 296,
                                columnNumber: 31
                            }, this),
                            " (مصر) أو زور",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://findahelpline.com",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "text-primary underline",
                                children: "findahelpline.com"
                            }, void 0, false, {
                                fileName: "[project]/src/app/ar-egy/page.tsx",
                                lineNumber: 297,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/ar-egy/page.tsx",
                        lineNumber: 295,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/ar-egy/page.tsx",
                lineNumber: 293,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/ar-egy/page.tsx",
        lineNumber: 155,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8be42b60._.js.map