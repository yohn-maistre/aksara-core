# Aksara

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People working in Papuan offices, communities and institutions, alongside
individual use. The current pilot includes an 8 GB Surface Pro 3 and phones.

## Product Purpose

A persistent, conversational intelligence that helps people do work together,
delegates bounded background tasks, and keeps useful documents and knowledge.

## Primary Workflow

Confirmed by the user on 4 November 2026: **shared channel → watch Aksara work →
review a shared artifact**. The redesign should make this complete journey clear.
Personal conversation, Home and Library remain part of the product.

## Operating Context

The existing React client runs in a browser and a Tauri 2 Windows wrapper. A
local Rust/SQLite authority and Node/Mastra host hold the workspace and agent
execution. Closing a window can leave the host running; sleeping or powering
off its computer cannot provide always-on execution. Hosted preview data is
disposable and disconnected from real models and private files.

## Capabilities and Constraints

Preserve current identity, audience, source provenance, exact reviewed revisions,
approval and effect-receipt boundaries. The editor and collaborative presence
must not establish authorization. Original source bytes remain intact.

The existing app supports Library, source-linked knowledge, saved documents,
private/shared threads, durable background work and limited native computer use.
Full production enrollment, isolated shared computers and live external channel
deployment remain separate qualification gates; consult the implementation ledger.

The next document experience should allow ordinary rich-text writing and editing,
with save state and readable review. The user excludes Terminus and requests
editor/platform candidates with permissive licenses and at least 5,000 GitHub stars.
No editor has been selected or integrated in this design-research increment.

## Brand Commitments

Aksara is warm, concise and language-adaptive in conversation. The existing name
and minimal open-triangle mark remain available. Earlier user references favor
graphite, lilac and warmth; the user now requests a substantially calmer, more
modern working interface. The visual alternatives are not yet a selected system.

## Evidence on Hand

Repository implementation, synthetic conformance fixtures and QA captures, and
user reports/screenshots. Do not invent institutional adoption, field performance,
working live accounts, device measurements or production readiness.

## Product Principles

- Make communal work and its audience understandable.
- Keep interaction responsive while background work progresses.
- Let people read, edit and review the actual artifact.
- Preserve custody and source provenance across surfaces and deployments.
- Keep the local package practical on modest hardware.
