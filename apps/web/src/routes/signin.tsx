import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
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
		<div className="flex justify-center">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Connexion</CardTitle>
					<CardDescription>
						Connecte-toi pour accéder à tes horaires
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="flex flex-col gap-4">
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
					</CardContent>
					<CardFooter>
						<Button type="submit" disabled={isSubmitting} className="w-full">
							{isSubmitting ? "Connexion..." : "Se connecter"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
