import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@workspace/ui/components/card";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/toast";
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
	beforeLoad: ({ context }) => {
		if (context.authData?.user) {
			throw redirect({ to: "/" });
		}
	},
});

function Signup() {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<SignupFormValues>({
		resolver: zodResolver(signupFormSchema),
		defaultValues: {
			name: "",
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: SignupFormValues) {
		const { data, error } = await authClient.signUp.email({
			name: values.name,
			email: `${values.username}@dreyz.cloud`,
			username: values.username,
			password: values.password,
		});

		if (error) {
			toast.add({
				title: "Oops !",
				description: "Une erreur est survenue",
				type: "error",
			});
			return;
		}

		toast.add({
			title: "Compte créé",
			description: `Bienvenue ${data.user.name.split(" ")[0]} !`,
			type: "success",
		});
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-full md:max-w-2xl xl:max-w-5xl overflow-hidden p-0">
				<CardContent className="grid xl:min-h-128 p-0 xl:grid-cols-2">
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col justify-center gap-4 p-6 md:p-8"
					>
						<div className="flex flex-col items-center gap-2 text-center">
							<CardTitle>Inscription</CardTitle>
							<CardDescription>
								Crée ton compte pour accéder à tes horaires.
							</CardDescription>
						</div>
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
						<Button type="submit" disabled={isSubmitting} className="w-full">
							{isSubmitting ? "Inscription..." : "S'inscrire"}
						</Button>
						<p className="text-center">
							Tu as déjà un compte ?{" "}
							<Link to="/signin" className="underline">
								Connecte-toi
							</Link>
						</p>
					</form>
					<div className="relative hidden xl:block bg-muted">
						<img
							src="https://images.unsplash.com/photo-1672552226650-796f40198c47?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
							alt=""
							className="absolute inset-0 h-full w-full object-cover"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
