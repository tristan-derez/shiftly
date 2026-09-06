import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/edit")({
	component: Edit,
});

function Edit() {
	return <div>Hello from Edit!</div>;
}
