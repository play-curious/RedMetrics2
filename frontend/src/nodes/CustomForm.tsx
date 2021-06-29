import React from "react";
import * as Form from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

import Button from "./Button";

export type CustomInput =
  | CustomTextInput
  | CustomSelectInput
  | CustomRadioInput
  | CustomTextAreaInput
  | CustomCheckboxInput
  | CustomCheckboxInputs;

export interface CustomTextInput {
  is: "text" | "password" | "email";
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  style?: React.CSSProperties;
}

export interface CustomSelectInput {
  is: "select";
  label?: string;
  required?: boolean;
  options: CustomOption[];
  style?: React.CSSProperties;
}

export interface CustomRadioInput {
  is: "radio";
  label?: string;
  required?: boolean;
  choices: CustomOption[];
  style?: React.CSSProperties;
}

export interface CustomTextAreaInput {
  is: "area";
  label?: string;
  required?: boolean;
  code?: boolean;
  jsonValidation?: boolean;
  style?: React.CSSProperties;
}

export interface CustomCheckboxInput {
  is: "checkbox";
  label?: string;
  required?: boolean;
  checked: boolean;
  style?: React.CSSProperties;
}

export interface CustomCheckboxInputs {
  is: "checkboxes";
  label?: string;
  required?: boolean;
  checks: CustomOption[];
  style?: React.CSSProperties;
}

export interface CustomOption {
  value: string;
  label: string;
}

export interface CustomFormOptions<T> {
  children?: any;
  className?: string;
  onSubmit: Form.SubmitHandler<T>;
  inputs: Record<Form.Path<T>, CustomInput | string>;
  style?: React.CSSProperties;
  submitText?: string;
}

export function is<T extends { is: string }>(
  item: { is: string },
  type: T["is"]
): item is T {
  return item.is === type;
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
          if(typeof input === "undefined") {
            console.error("Form input is undefined for", name);
            return <div>{ name + " is undefined" }</div>;
          } else if (typeof input === "string") {
            return (
              <input type="hidden" {...register(name, { value: input })} />
            );
          } else if (is<CustomRadioInput>(input, "radio")) {
            return (
              <label>
                {input.label ?? name} <hr />
                {input.choices.map(({ label, value }) => {
                  return (
                    <label>
                      {label}
                      <input
                        type="radio"
                        value={value}
                        {...register(name, { required: true })}
                      />
                    </label>
                  );
                })}
                <ErrorMessage errors={errors} name={name as any} />
              </label>
            );
          } else if (is<CustomSelectInput>(input, "select")) {
            return (
              <label>
                {input.label ?? name} <hr />
                <select
                  {...register(name, { required: input.required })}
                  {...input}
                >
                  {input.options.map((option) => {
                    return <option value={option.value}>{option.label}</option>;
                  })}
                </select>
                <ErrorMessage errors={errors} name={name as any} />
              </label>
            );
          } else if (is<CustomCheckboxInputs>(input, "checkboxes")) {
            return (
              <label>
                {input.label ?? name} <hr />
                {input.checks.map(({ value, label }, i) => {
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
                })}
                <ErrorMessage errors={errors} name={name as any} />
              </label>
            );
          } else if (is<CustomCheckboxInput>(input, "checkbox")) {
            return (
              <label>
                <hr />
                <input
                  type="checkbox"
                  {...register(name, { required: input.required ?? false })}
                  {...input}
                />
                {input.label ?? name}
                <ErrorMessage errors={errors} name={name as any} />
              </label>
            );
          } else if (is<CustomTextAreaInput>(input, "area")) {
            let output = (
              <textarea
                {...register(name, {
                  required: input.required ?? false,
                  validate: input.jsonValidation
                    ? (value) => {
                        const stringValue = String(value);
                        try {
                          JSON.parse(stringValue);
                          //const custom_data = JSON.parse(stringValue);
                          // value = JSON.stringify(
                          //   custom_data,
                          //   null,
                          //   2
                          // );
                          return true;
                        } catch (error) {
                          return error.message;
                        }
                      }
                    : undefined,
                })}
                {...input}
                defaultValue={input.jsonValidation ? "{}" : ""}
              />
            );

            if (input.code) {
              output = <code>{output}</code>;
            }

            return (
              <label>
                {input.label ?? name} <hr />
                {output}
                <ErrorMessage errors={errors} name={name as any} />
              </label>
            );
          } else {
            return (
              <label>
                {input.label ?? name} <hr />
                <input
                  type={input.is}
                  {...register(name, {
                    required: input.required ?? false,
                    minLength: input.minLength,
                    maxLength: input.maxLength,
                  })}
                  {...input}
                />
                <ErrorMessage errors={errors} name={name as any} />
              </label>
            );
          }
        })}
        {options.children}
        <Button submit>{options.submitText ?? "Submit"}</Button>
      </form>
    </>
  );
}
