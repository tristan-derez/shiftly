import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@workspace/ui/components/card";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const signinFormSchema = z.object({
	username: z
		.string()
		.min(1, "Le nom d'utilisateur est requis")
		.max(30, "Le nom d'utilisateur ne doit pas dépasser 30 caractères"),
	password: z.string().min(1, "Le mot de passe est requis"),
});

type SigninFormValues = z.infer<typeof signinFormSchema>;

export const Route = createFileRoute("/signin")({
	component: SignIn,
});

function SignIn() {
	const navigate = useNavigate();
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<SigninFormValues>({
		resolver: zodResolver(signinFormSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: SigninFormValues) {
		const { error } = await authClient.signIn.username(values);

		if (error) {
			setError("root", { message: error.message ?? "Une erreur est survenue" });
			return;
		}

		navigate({ to: "/" });
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-5xl overflow-hidden p-0">
				<CardContent className="grid xl:min-h-128 p-0 xl:grid-cols-2">
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col justify-center gap-2 p-6 md:p-8"
					>
						<div className="flex flex-col items-center gap-2 text-center">
							<CardTitle>Connexion</CardTitle>
							<CardDescription>
								Connecte-toi pour accéder à tes horaires
							</CardDescription>
						</div>
						<Controller
							control={control}
							name="username"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="username">Nom d'utilisateur</FieldLabel>
									<Input
										id="username"
										autoComplete="username"
										aria-invalid={fieldState.invalid}
										{...field}
									/>
									<FieldError
										errors={fieldState.error ? [fieldState.error] : undefined}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="password"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="password">Mot de passe</FieldLabel>
									<Input
										id="password"
										type="password"
										autoComplete="current-password"
										aria-invalid={fieldState.invalid}
										{...field}
									/>
									<FieldError
										errors={fieldState.error ? [fieldState.error] : undefined}
									/>
								</Field>
							)}
						/>
						<FieldError errors={errors.root ? [errors.root] : undefined} />
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full mt-2"
						>
							{isSubmitting ? "Connexion..." : "Se connecter"}
						</Button>
						<p className="text-center">
							Tu n'as pas encore de compte ?{" "}
							<Link to="/signup" className="underline">
								Inscris-toi
							</Link>
						</p>
					</form>
					<div className="relative hidden xl:block bg-muted">
						<img
							src="https://images.unsplash.com/photo-1735020886196-bed638cc1809?q=80&w=1082&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
							alt=""
							className="absolute inset-0 h-full w-full object-cover"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
