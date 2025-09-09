
'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { Form, FormField, FormResponse as FormResponseType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ResponseSummaryProps {
  form: Form;
  responses: FormResponseType[];
}

export function ResponseSummary({ form, responses }: ResponseSummaryProps) {
  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No responses yet to generate a summary.</p>
        </CardContent>
      </Card>
    );
  }

  const getSummaryData = (field: FormField) => {
    const counts: { [key: string]: number } = {};

    if (field.options) {
      (field.options as {label: string}[]).forEach(opt => counts[opt.label] = 0);
    }

    responses.forEach(response => {
      const answer = response.data[field.id];
      if (Array.isArray(answer)) { // Checkboxes
        answer.forEach(val => {
          const option = (field.options as {value: string, label: string}[])?.find(opt => opt.value === val);
          if (option) {
             counts[option.label] = (counts[option.label] || 0) + 1;
          }
        });
      } else { // Radio, Select
          const option = (field.options as {value: string, label: string}[])?.find(opt => opt.value === answer);
          if(option) {
            counts[option.label] = (counts[option.label] || 0) + 1;
          }
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getNumericSummary = (field: FormField) => {
    const values = responses.map(r => r.data[field.id]).filter(v => typeof v === 'number' || !isNaN(Number(v))) as number[];
    if (values.length === 0) return { avg: 0, min: 0, max: 0, distribution: [] };
    
    const sum = values.reduce((acc, v) => acc + Number(v), 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const distribution: { [key: number]: number } = {};
    values.forEach(v => {
      distribution[v] = (distribution[v] || 0) + 1;
    });

    return {
      avg: avg.toFixed(2),
      min,
      max,
      distribution: Object.entries(distribution).map(([name, value]) => ({ name: String(name), value })),
    };
  };

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {form.fields.map(field => {
        if (['radio', 'select', 'checkbox'].includes(field.type)) {
          const data = getSummaryData(field);
          return (
            <Card key={field.id}>
              <CardHeader>
                <CardTitle>{field.label}</CardTitle>
                <CardDescription>Based on {responses.length} responses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Responses" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          );
        }

        if (['rating', 'slider', 'number'].includes(field.type)) {
            const summary = getNumericSummary(field);
            return (
              <Card key={field.id}>
                <CardHeader>
                  <CardTitle>{field.label}</CardTitle>
                  <CardDescription>Average: {summary.avg} | Min: {summary.min} | Max: {summary.max}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={summary.distribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Count" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          }

        if (['text', 'textarea'].includes(field.type)) {
          return (
             <Card key={field.id} className="lg:col-span-2">
               <CardHeader>
                 <CardTitle>{field.label}</CardTitle>
                 <CardDescription>Showing latest 5 text responses</CardDescription>
               </CardHeader>
               <CardContent>
                  <ul className="space-y-3">
                    {responses.slice(0, 5).map(r => {
                      const answer = r.data[field.id];
                      return answer ? (
                        <li key={r.id} className="text-sm p-3 bg-muted/50 rounded-md border">
                          {String(answer)}
                        </li>
                      ) : null
                    })}
                  </ul>
               </CardContent>
             </Card>
          )
        }

        return null;
      })}
    </div>
  );
}
