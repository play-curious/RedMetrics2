import React from "react";
import Select from "react-select";
import * as Form from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

import Button from "./Button";

export type CustomInput =
  | CustomTextInput
  | CustomSelectInput
  | CustomRadioInput
  | CustomCheckboxInput
  | CustomCheckboxInputs;

export interface CustomTextInput {
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "password" | "email";
  style?: React.CSSProperties;
}

export interface CustomSelectInput {
  label?: string;
  required?: boolean;
  options: CustomOption[];
  style?: React.CSSProperties;
}

export interface CustomRadioInput {
  label?: string;
  required?: boolean;
  choices: CustomOption[];
  style?: React.CSSProperties;
}

export interface CustomCheckboxInput {
  label?: string
  required?: boolean;
  checked: boolean;
  style?: React.CSSProperties;
}

export interface CustomCheckboxInputs {
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
  children?: any
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
            return <label> { input.label ?? name } <hr/>
              {input.choices.map(({ label, value }) => {
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
              })}
              <ErrorMessage errors={errors} name={name as any} />
            </label>;
          } else if (is<CustomSelectInput>(input, "options")) {
            return (
              <label> { input.label ?? name } <hr/>
                <Select
                  {...register(name, { required: input.required })}
                  {...input}
                />
                <ErrorMessage errors={errors} name={name as any} />
              </label>
            );
          } else if (is<CustomCheckboxInputs>(input, "checks")) {
            return <label> { input.label ?? name } <hr/>
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
          } else if(is<CustomCheckboxInput>(input, "checked")) {
            return <label>
              <hr/>
              <input
                type="checkbox"
                {...register(name, { required: input.required ?? false })}
                {...input}
              /> { input.label ?? name }
              <ErrorMessage errors={errors} name={name as any} />
            </label>
          } else {
            if (!input.type) input.type = "text";
            return (
              <label> { input.label ?? name } <hr/>
                <input
                  {...register(name, { required: input.required ?? false })}
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
