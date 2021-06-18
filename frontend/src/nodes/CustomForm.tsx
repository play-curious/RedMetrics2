import React from "react";
import Select from "react-select";
import * as Form from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

import Button from "./Button";

export type CustomInput =
  | CustomTextInput
  | CustomSelectInput
  | CustomRadioInput
  | CustomCheckboxInputs;

export interface CustomTextInput {
  value?: string;
  placeHolder?: string;
  required?: boolean;
  type?: "text" | "password" | "email";
  style?: React.CSSProperties;
}

export interface CustomSelectInput {
  required?: boolean;
  options: CustomOption[];
  style?: React.CSSProperties;
}

export interface CustomRadioInput {
  required?: boolean;
  choices: CustomOption[];
  style?: React.CSSProperties;
}

export interface CustomCheckboxInputs {
  required?: boolean;
  checks: CustomOption[];
  style?: React.CSSProperties;
}

export interface CustomOption {
  value: string;
  label: string;
}

export interface CustomFormOptions<T> {
  className?: string;
  onSubmit: Form.SubmitHandler<T>;
  inputs: Record<Form.Path<T>, CustomInput | string>;
  style?: React.CSSProperties;
  submitText?: string;
}

export function is<T>(item: any, ifHas: keyof T): item is T {
  return item.hasOwnProperty(ifHas);
}

export default function CustomForm<T>(options: CustomFormOptions<T>) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = Form.useForm<T>();

  const inputEntries = Object.entries(options.inputs) as [
    name: Form.Path<T>,
    input: CustomInput
  ][];

  return (
    <>
      <form
        onSubmit={handleSubmit(options.onSubmit)}
        className={options.className}
      >
        {inputEntries.map(([name, input]) => {
          if(typeof input === "string"){
            return <input type="hidden" {...register(name, { value: input })}/>
          }else if (is<CustomRadioInput>(input, "choices")) {
            return input.choices.map(({ label, value }) => {
              return (
                <label>
                  {label}
                  <input
                    {...register(name, { required: true })}
                    type="radio"
                    value={value}
                  />
                </label>
              );
            });
          } else if (is<CustomSelectInput>(input, "options")) {
            return (
              <>
                <Select
                  {...register(name, { required: input.required })}
                  {...input}
                />
                <ErrorMessage errors={errors} name={name as any} />
              </>
            );
          } else if (is<CustomCheckboxInputs>(input, "checks")) {
            return input.checks.map(({ value, label }, i) => {
              return (
                <label className="whitespace-nowrap">
                  <input
                    type="checkbox"
                    value={value}
                    {...input}
                    {...register(`${name}.${i}` as typeof name, {
                      required: input.required,
                    })}
                  />
                  {label}
                </label>
              );
            });
          } else {
            if (!input.type) input.type = "text";
            return (
              <>
                <input
                  {...register(name, { required: input.required ?? false })}
                  {...input}
                />
                <ErrorMessage errors={errors} name={name as any} />
              </>
            );
          }
        })}
        <Button submit>{options.submitText ?? "Submit"}</Button>
      </form>
    </>
  );
}
