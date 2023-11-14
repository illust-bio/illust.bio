"use client";

import React from "react";

import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import styles from "./page.module.css";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface ErrorMessage {
    key: string;
    value: string;
}

export default function Home() {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const formContainerRef = React.useRef<HTMLDivElement>(null);

    const [isSubdomainCheckLoading, setIsSubdomainCheckLoading] =
        React.useState<boolean>(false);

    const [inputValue, setInputValue] = React.useState<string>("");
    const [placeholder, setPlaceholder] = React.useState<string>("your-name");
    const [errorMsgs, setErrorMsgs] = React.useState<ErrorMessage[]>([]);

    const typingSpeed = 100; // in milliseconds

    const placeholderSuffixes = [
        "name",
        "username",
        "twitch",
        "twitter",
        "domain",
        "fanbox",
        "character",
        "instagram",
        "nick",
        "pixiv",
    ];

    async function writeOnPlaceholder(prefix: string, text: string) {
        let index = 0;
        setPlaceholder(prefix + "|");

        var interval = setInterval(() => {
            if (index > text.length) {
                clearInterval(interval);
                return;
            }

            setPlaceholder(prefix + text.slice(0, index++) + "|");
        }, typingSpeed);

        await sleep(typingSpeed * text.length + typingSpeed);
        setPlaceholder(prefix + text);
        return;
    }

    async function deletePlaceholder(prefix: string, text: string) {
        let index = text.length;
        setPlaceholder(prefix + text + "|");

        var interval = setInterval(() => {
            if (index == 0) {
                clearInterval(interval);
                return;
            }

            setPlaceholder(prefix + text.slice(0, --index) + "|");
        }, typingSpeed);

        await sleep(typingSpeed * text.length + typingSpeed);
        setPlaceholder(prefix);
        return;
    }

    React.useEffect(() => {
        let index = 0;

        const interval = setInterval(async () => {
            clearInterval(interval);
            console.log("After clearing!");
            while (true) {
                await deletePlaceholder(
                    "your-",
                    placeholderSuffixes[index % placeholderSuffixes.length]
                );
                index++;
                await writeOnPlaceholder(
                    "your-",
                    placeholderSuffixes[index % placeholderSuffixes.length]
                );
                await sleep(2000);
            }
        }, 2000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    function showInputError(message: string) {
        let errorKey = Math.random().toString();

        setErrorMsgs((v) => [
            ...v,
            {
                key: errorKey,
                value: message,
            },
        ]);
        setTimeout(() => {
            setErrorMsgs((v) => v.filter((value) => value.key != errorKey));
        }, 3000);
    }

    return (
        <main className="flex flex-col items-center py-16 px-6 min-h-screen relative">
            <div className="w-full max-w-xl flex flex-col gap-8">
                <h1 className="font-mono">ILLUST.BIO</h1>
                <h6 className="-mt-4">
                    Are you an illustrator looking for a free space to host your
                    portfolio? Use <Hl>illust.bio</Hl> and showcase your artwork
                    to the world! Claim your (sub)domain to get started.
                </h6>
                <div className="flex flex-col gap-2">
                    <div
                        className="flex flex-row items-center max-w-full"
                        ref={formContainerRef}
                    >
                        <div
                            className="flex flex-row items-center relative flex-1 cursor-text overflow-x-hidden border-l-4 border-primary"
                            onClick={() => inputRef.current?.focus()}
                        >
                            <input
                                type="text"
                                placeholder={placeholder}
                                className="border-y-4 border-primary bg-on-primary text-secondary outline-none font-mono py-2 pl-2 placeholder:text-primary/50 placeholder:font-normal box-content font-bold"
                                style={{
                                    width:
                                        inputValue.length > 0
                                            ? inputValue.length + "ch"
                                            : placeholder.length + "ch",
                                }}
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => {
                                    let currentValue = e.target.value
                                        .slice(0, 63)
                                        .replace(" ", "-")
                                        .toLowerCase();
                                    let parsedValue = currentValue.replace(
                                        /[^a-z0-9-]/gi,
                                        ""
                                    );

                                    setInputValue(parsedValue);

                                    if (currentValue.includes(".")) {
                                        showInputError(
                                            "We don't support fourth-level domains, sorry!"
                                        );
                                    }
                                    if (currentValue.includes("_")) {
                                        showInputError(
                                            "We don't support underscores. Try with dashes instead!"
                                        );
                                    }
                                }}
                            />
                            <div className="h-full py-2 pr-2 border-y-4 border-primary bg-on-primary text-primary font-mono">
                                .illust.bio
                            </div>
                            <div className="h-6 box-content py-2 border-y-4 border-primary bg-on-primary text-primary font-mono flex-1"></div>
                        </div>
                        <button
                            className="p-2 border-4 border-primary bg-primary text-on-primary font-bold whitespace-nowrap relative"
                            style={{
                                cursor:
                                    inputValue.length > 0
                                        ? "pointer"
                                        : "not-allowed",
                            }}
                            onClick={async () => {
                                if (inputValue.length == 0) {
                                    formContainerRef.current?.classList.add(
                                        styles.tremble
                                    );
                                    setTimeout(() => {
                                        formContainerRef.current?.classList.remove(
                                            styles.tremble
                                        );
                                    }, 500);

                                    return;
                                }

                                if (isSubdomainCheckLoading) return;

                                setIsSubdomainCheckLoading(true);

                                const res = await fetch(
                                    "/api/check-availability?subdomain=" +
                                        encodeURIComponent(inputValue)
                                );

                                let data: {
                                    available: boolean;
                                };

                                try {
                                    data = await res.json();
                                } catch (e) {
                                    showInputError(
                                        "Sorry! There was an error while checking for availability."
                                    );
                                    setIsSubdomainCheckLoading(false);
                                    return;
                                }

                                if (!data.available) {
                                    showInputError(
                                        "Sorry, this subdomain is already taken. You can try another one!"
                                    );
                                    setIsSubdomainCheckLoading(false);
                                    return;
                                }

                                window.location.href = `https://github.com/Nekidev/illust.bio/issues/new?assignees=Nekidev&labels=${encodeURIComponent(
                                    "subdomain request"
                                )}&template=new-illust-bio-subdomain.md&title=${encodeURIComponent(
                                    `Domain request: ${inputValue}.illust.bio`
                                )}`;
                            }}
                        >
                            {isSubdomainCheckLoading && (
                                <div className="h-6 w-6 absolute top-0 bottom-0 left-0 right-0 m-auto border-4 border-on-primary rounded-full border-r-transparent animate-spin"></div>
                            )}
                            <span
                                style={{
                                    opacity: isSubdomainCheckLoading ? 0 : 1,
                                }}
                            >
                                CLAIM IT!
                            </span>
                        </button>
                    </div>
                    <p
                        className="text-sm"
                    >
                        Only letters, numbers, and hyphens are allowed.
                    </p>
                    <AnimatePresence>
                        {errorMsgs.map(
                            (value: ErrorMessage): React.ReactNode => {
                                return (
                                    <motion.div
                                        key={value.key}
                                        initial={{
                                            opacity: 0,
                                            height: 0,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            height: "auto",
                                        }}
                                        exit={{
                                            opacity: 0,
                                            height: 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                        className="text-sm flex flex-row items-center gap-1"
                                    >
                                        <ExclamationTriangleIcon className="h-4 w-4 mt-0.5" />
                                        <div className="leading-none">
                                            {value.value}
                                        </div>
                                    </motion.div>
                                );
                            }
                        )}
                    </AnimatePresence>
                </div>
                <p>
                    Your page needs to have a reasonable (amount of) content and
                    a <Hl>considerable relation to illustration</Hl> to be
                    accepted. The domain name must be related to your page.
                </p>
                <div></div> {/* Spacer */}
                <h3 className="font-bold">How does it work?</h3>
                <div>
                    <Step
                        number={1}
                        title="Create a GitHub account"
                        hasTop={false}
                    >
                        First of all, you need to create an account at{" "}
                        <Link href="https://github.com/login" target="_blank">
                            GitHub
                        </Link>
                        , or log into your account if you already have one.
                    </Step>
                    <Step number={2} title="Create a new issue">
                        Visit the{" "}
                        <Link
                            href="https://github.com/Nekidev/illust.bio/issues/new/choose"
                            target="_blank"
                        >
                            illust.bio repository
                        </Link>{" "}
                        and create an issue with the following information:
                        <ol className="list-decimal ml-4 my-2 flex flex-col gap-2">
                            <li>
                                <b>The domain name.</b> This is the{" "}
                                <Hl>
                                    {inputValue.length > 0
                                        ? inputValue
                                        : "your-name"}
                                    .illust.bio
                                </Hl>{" "}
                                that you want.
                            </li>
                            <li>
                                <b>Any records you want to create.</b> You can
                                create a table with a <i>type</i>, <i>name</i>,
                                and <i>content</i> column.
                            </li>
                        </ol>
                        <i>
                            Note: No clue about what all these things mean? Go
                            to the{" "}
                            <Link
                                href="https://github.com/Nekidev/illust.bio/discussions"
                                target="_blank"
                            >
                                repository discussions
                            </Link>{" "}
                            and ask for help!
                        </i>
                    </Step>
                    <Step
                        number={3}
                        title="Wait for confirmation"
                        hasBottom={false}
                    >
                        Once you've completed everything, we'll review your
                        submission and get back to you shortly. If everyting is
                        correct, you should just receive a confirmation comment
                        in your issue.
                    </Step>
                </div>
                <div></div> {/* Spacer */}
                <h3 className="font-bold">Why?</h3>
                <p>
                    Great question! These are some reasons why you should use{" "}
                    <Hl>illust.bio</Hl>:
                    <ol className="list-decimal ml-4 mt-4 flex flex-col gap-2">
                        <li>
                            <b>It's completely free.</b> No need to pay yearly
                            for it. Small artists may not have the resources to
                            pay for a domain, so this is the perfect choice for
                            them!
                        </li>
                        <li>
                            <b>Your name is never hidden.</b> Links like
                            linktr.ee/
                            {inputValue.length > 0
                                ? inputValue
                                : "your-name"}{" "}
                            usually get truncated to just "linktr.ee" or
                            "linktr.ee/your..." and your name (the important
                            part) gets cut off. With{" "}
                            <Hl>
                                {inputValue.length > 0
                                    ? inputValue
                                    : "your-name"}
                                .illust.bio
                            </Hl>
                            , that won't happen anymore. And even if it is
                            truncated, your name will still be visible.
                        </li>
                        <li>
                            <b>No branding.</b> Share your art to the world
                            without unwanted ads!
                        </li>
                        <li>
                            <b>It shows what you do.</b> What does{" "}
                            {inputValue.length > 0 ? inputValue : "your-name"}
                            .carrd.co say about you? Nothing really. With{" "}
                            <Hl>
                                {inputValue.length > 0
                                    ? inputValue
                                    : "your-name"}
                                .illust.bio
                            </Hl>
                            , people will know what they're going to find even
                            before clicking your link.
                        </li>
                        <li>
                            <b>It's yours for (almost) whatever you want it.</b>{" "}
                            Do you want to host your art portfolio with your
                            subdomain? Do you want to receive emails from people
                            who want to commission you? Maybe both at the same
                            time!
                        </li>
                    </ol>
                </p>
                <div></div> {/* Spacer */}
                <div className="bg-primary p-4 flex flex-col items-start gap-2 text-on-primary">
                    <h5 className="font-bold">Important!</h5>
                    <p>
                        As the owner of the content you publish, you're also
                        responsible for all the duties that mean hosting it.
                    </p>
                </div>
                <div></div> {/* Spacer */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-8">
                        <div className="flex flex-row items-center gap-8">
                            <Link
                                href="https://github.com/Nekidev/illust.bio/blob/main/TERMS.md"
                                className="no-underline"
                            >
                                Terms of Use
                            </Link>
                            <Link
                                href={`mailto:sponsor@nyeki.dev?subject=${encodeURIComponent(
                                    "Sponsoring illust.bio"
                                )}&body=${encodeURIComponent(
                                    "Hello, and thank you for considering sponsoring this project! You can send me your offer and we'll discuss it. With +200USD yearly your logo gets displayed in the landing page and in the GitHub readme."
                                )}`}
                                target="_blank"
                                className="no-underline"
                            >
                                Sponsor
                            </Link>
                        </div>
                        <Link
                            href="https://www.paypal.com/donate/?hosted_button_id=BBUCHU6QPZDWQ"
                            target="_blank"
                            className="no-underline"
                        >
                            Help us cover registration fees
                        </Link>
                    </div>
                    <div className="h-px bg-primary"></div>
                    <p className="text-sm">
                        This website's design is heavily inspired by{" "}
                        <Link href="https://js.org" target="_blank">
                            js.org
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

function Hl({ children }: { children: React.ReactNode }): React.ReactNode {
    return <span className="highlight">{children}</span>;
}

function Step({
    number,
    title,
    children,
    hasTop = true,
    hasBottom = true,
}: {
    number: number;
    title: string;
    children: React.ReactNode;
    hasTop?: boolean;
    hasBottom?: boolean;
}): React.ReactNode {
    return (
        <div
            className={`flex flex-row gap-4 items-stretch relative ${
                !hasTop ? "-mt-2" : ""
            }`}
        >
            <div className="flex flex-col items-center gap-1 min-h-full">
                <div className={`w-1 h-1 ${hasTop ? "bg-primary" : ""}`}></div>
                <div className="border-2 border-primary h-7 w-7 flex flex-col items-center justify-center text-primary font-bold bg-on-primary select-none">
                    {number}
                </div>
                <div
                    className={`w-1 flex-1 ${hasBottom ? "bg-primary" : ""}`}
                ></div>
            </div>
            <div
                className={`flex-1 flex flex-col gap-2 pt-2 ${
                    hasBottom ? "pb-6" : ""
                }`}
            >
                <h5 className="font-semibold">{title}</h5>
                <div>{children}</div>
            </div>
        </div>
    );
}
