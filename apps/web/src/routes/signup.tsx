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

const signupFormSchema = z.object({
	name: z
		.string()
		.min(1, "Le nom est requis")
		.max(100, "Le nom ne doit pas dépasser 100 caractères"),
	username: z
		.string()
		.min(1, "Le nom d'utilisateur est requis")
		.max(30, "Le nom d'utilisateur ne doit pas dépasser 30 caractères"),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export const Route = createFileRoute("/signup")({
	component: Signup,
});

function Signup() {
	const navigate = useNavigate();
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
		setError,
	} = useForm<SignupFormValues>({
		resolver: zodResolver(signupFormSchema),
		defaultValues: {
			name: "",
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: SignupFormValues) {
		const { error } = await authClient.signUp.email({
			name: values.name,
			email: `${values.username}@dreyz.cloud`,
			username: values.username,
			password: values.password,
		});

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
					<CardTitle>Inscription</CardTitle>
					<CardDescription>
						Créez votre compte pour accéder à vos horaires.
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="flex flex-col gap-4">
						<Controller
							control={control}
							name="name"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="name">Nom</FieldLabel>
									<Input
										id="name"
										autoComplete="name"
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
										autoComplete="new-password"
										aria-invalid={fieldState.invalid}
										{...field}
									/>
									<FieldError
										errors={fieldState.error ? [fieldState.error] : undefined}
									/>
								</Field>
							)}
						/>
					</CardContent>
					<CardFooter>
						<Button type="submit" disabled={isSubmitting} className="w-full">
							{isSubmitting ? "Inscription..." : "S'inscrire"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
