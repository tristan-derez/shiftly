import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/edit")({
	component: Edit,
});

function Edit() {
	return <div>Hello from Edit!</div>;
}
